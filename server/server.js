const express = require('express');
const session = require("express-session");
const dotenv = require("dotenv"); dotenv.config();
const bcrypt = require('bcrypt');
const { Client } = require("pg");
const { response } = require('express');
const app = express();
const PORT = 8000;
const SALTROUNDS = 10;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({secret: "aSecretToComputeTheHash", resave: false, saveUninitialized: false, cookie: {maxAge: 1000*60*60}}));


const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    databse: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
})
client.connect();

async function get_current_semester(){
    let top = (await client.query(`
    select year,semester
    from teaches
    group by (year,semester)
    order by year desc,semester asc
    limit 1;
    `)).rows;
    //console.log(top);
    let current_year = top[0].year;
    let current_semester = top[0].semester;
    return {'0':current_year,'1':current_semester};
}
app.post('/login', async (req, res) => {
    if(req.session.userID){
        res.send({isAuthenticated: true,errmsg:""});
    }   
    else{
        let userID = req.body.userid 
        let password = req.body.password
        let validUser = (await client.query("select * from student where cast(id as int)=$1;",[userID])).rows.length!=0
        if(validUser){
            let entry
            let entryPresent = (entry = await client.query("select * from user_password where id=$1",[userID])).rows.length!=0
            if(entryPresent){
                entry = entry.rows[0]
                let ismatch = await bcrypt.compare(password,entry.hashed_password);
                let response = {isAuthenticated: ismatch,errmsg:""}
                console.log(password,entry,ismatch)
                if(!ismatch){
                    response.errmsg = "Wrong Password"
                }
                else {
                    req.session.userID = userID;
                }
                res.send(response);

            }
            else{
                let hashedPassword = await bcrypt.hash(password,SALTROUNDS);
                await client.query("insert into user_password values ($1,$2)",[userID,hashedPassword]);
                req.session.userID = userID;
                res.send({isAuthenticated:true,errmsg:""});
            }
        }
        else{
            return res.send({isAuthenticated: false,errmsg:"Invalid User"})
        }
        
    } 
});

app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.send({isAuthenticated:false,msg:"Logged out"});
})
app.get("/home",async (req,res)=>{
    if(req.session.userID){
        let response = {
            isAuthenticated: true,
            userInfo: [],
            current_sem: [],
            previous_sems: []
        }
        userID = req.session.userID;
        response.userInfo = (await client.query("select * from student where id=$1;",[userID])).rows[0];
        let all_courses = (await client.query(`
        select year,semester,json_agg(json_build_object('course_id',course_id,'title',title,'sec_id',sec_id,'credits',credits,'grade',grade)) courses
        from takes natural join course
        where cast(id as int)=$1
        group by (year,semester)
        order by year desc,semester asc;`
        ,[userID])).rows;
        if(all_courses.length>=1) response.current_sem = all_courses[0]
        if(all_courses.length>=2) response.previous_sems = all_courses.slice(1);
       // console.log(response.current_sem);
        return res.send(response);
    }
    else{
        return res.send({isAuthenticated: false,errmsg:"Not logged in"});
    }
});

app.post("/home",async (req,res)=>{
    if(req.session.userID){
        let response = {
            msg: "",
            success: true
        }
        let obj = req.body;
        let userID = req.session.userID;
        let sem = await get_current_semester();
        let current_year = sem['0']
        let current_semester = sem['1'];

        // let current_year = top[0].year;
        // let current_semester = top[0].semester;
        await client.query(`
        delete from takes 
        where id=$1 and course_id=$2 and sec_id=$3 and semester=$4 and year=$5;
        `,[userID,obj.course_id,obj.sec_id,current_semester,current_year]);
        response.msg="Succesfully dropped the course";
        res.send(response);
    }
    else{
        return res.send({isAuthenticated: false,errmsg:"Not logged in"});
    }
})

app.get("/home/registration",async (req,res)=>{
    if(req.session.userID){
        let response = {
            isAuthenticated: true,
            courses: []
        }
        response.courses = (await client.query(`
        with Y(year) as (select max(year) from teaches limit 1), 
        S(semester) as (select min(semester) from teaches where year in (select * from Y)) 
        select course_id,title,json_agg(sec_id) section
        from teaches natural join course
        where year in (select * from Y) and semester in (select * from S) 
        group by (course_id,title)
        order by course_id asc;
        `)).rows;
        res.send(response);
    }
    else{
        return res.send({isAuthenticated: false,errmsg:"Not logged in"});
    }
});

app.post("/home/registration",async (req,res)=>{
    if(req.session.userID){
       // console.log("In the server")
        let obj = req.body;
        let userID = req.session.userID;
        let sem = await get_current_semester();
        let current_year = sem['0']
        let current_semester = sem['1'];        
        console.log(obj.course_id)
        let entry = (await client.query(`
        select * from takes
        where course_id=$1 and id=$2 and semester=$3 and cast(year as int)=$4 and sec_id=$5
        `,[obj.course_id,userID,current_semester,current_year,obj.sec_id])).rows;
        console.log("Result: ",entry)
        if(entry.length==0){
            let response = {
                msg: "",
                success: true,
            }   
            let tofinish = (await client.query(`
            select prereq_id from prereq where course_id=$1 
            except 
            (select takes.course_id from takes where id=$2);
            `,[obj.course_id,userID])).rows;
            if(tofinish.length==0){
                // check for slot clashes
                let clash = (await client.query(`
                (select time_slot_id 
                from section 
                where sec_id=$3 and course_id=$2 and semester=$4 and year=$5) 
                except 
                (select time_slot_id 
                from takes natural join section 
                where id=$1 and semester=$4 and year=$5);
                `,[userID,obj.course_id,obj.sec_id,current_semester,current_year])).rows.length==0;
                if(clash){
                    response.msg = "Slot clash";
                    response.success = false;
                }
                else{
                    response.msg = "Successfully Registered";
                    response.success = true;
                    await client.query("insert into takes values ($1, $2, $3, $4, $5, 'Z');",[userID,obj.course_id,obj.sec_id,current_semester,current_year]);
                }
                res.send(response);
            }
            else{
                response.msg = "This course has prerequisties";
                response.success = false;
                res.send(response);
            }


        }
        else{
            let response = {
                msg: "Already Registered",
                success: true,
            };
            res.send(response);
        }

    }
})

app.get("/course/running",async (req,res)=>{
    if(req.session.userID){
        let sem = await get_current_semester();
        let current_year = sem['0']
        let current_semester = sem['1'];    
        let depts = (await client.query(`
        select dept_name department,building,count(distinct course_id)
        from teaches natural join course natural join department
        where semester=$1 and year=$2
        group by (dept_name,building)
        `,[current_semester,current_year])).rows;
        depts = depts.map((obj)=>{
            Object.defineProperty(obj, "No of courses",
                Object.getOwnPropertyDescriptor(obj, 'count'));
            delete obj['count'];
            console.log(obj);
            return obj;
        })
        let response = {
            isAuthenticated: true,
            depts_info: depts
        }
        console.log(response);
        res.send(response);
    }
    else{
        res.send({isAuthenticated:false,msg:"Not logged in"});
    }
})
app.get("/course/running/:dept_name",async (req,res)=>{
    if(req.session.userID){
        let department = req.params.dept_name;
        console.log(department)
        let sem = await get_current_semester();
        let current_year = sem['0']
        let current_semester = sem['1']; 
        let courses = (await client.query(`
        select  distinct course_id,title,credits
        from teaches natural join course
        where dept_name=$1
        `,[department])).rows;
        let response = {
            isAuthenticated: true,
            courses: courses
        }
        res.send(response);
    }
    else{
        res.send({isAuthenticated:false,msg:"Not logged in"});
    }
})
app.get("/course/:course_id", async (req,res)=>{
    if(req.session.userID){
        let course_id = req.params.course_id;
        console.log(course_id);
        let course_info = (await client.query(`
        with time_slot_upd(time_slot_id,day,start_time,end_time) 
        as (select time_slot_id,day,concat(start_hr,':',start_min) as start_time,concat(end_hr,':',end_min) as end_time from time_slot) 
        select year,semester,sec_id,json_build_array(course_id,title,credits,building,room_number,json_agg(json_build_array(day,start_time,end_time)),json_agg(distinct jsonb_build_object('id',instructor.id,'name',instructor.name))) as other_info 
        from 
        (teaches natural join section natural join course natural join time_slot_upd) join instructor on instructor.id=teaches.id
        where course_id=$1
        group by (year,semester,sec_id,course_id,title,credits,building,room_number)
        order by year desc,semester asc;
        `,[course_id])).rows;        
        let prereqs = (await client.query(`
        select course_id,title
        from course
        where course_id in 
        (  select prereq_id
            from course natural join prereq
            where course_id=$1
        ) 
        `,[course_id])).rows;
        //console.log(course_info[0].other_info);
        const dict = {
            'M':'Monday',
            'T':'Tuesday',
            'W':'Wednesday',
            'R':'Thursday',
            'F':'Friday',
        }
        console.log(course_info[0].other_info[5])
        course_info = course_info.map((obj)=>{
            obj.data = [{field: "course_id",content: obj.other_info[0]}];
            obj.data.push({field: "title",content: obj.other_info[1]});
            obj.data.push({field: "credits",content: obj.other_info[2]});
            obj.data.push({field: "sec_id", content: obj.sec_id})
            obj.data.push({field: "building",content: obj.other_info[3]})
            obj.data.push({field: "room_number",content: obj.other_info[4]})
            let time_slots = obj.other_info[5].map((arr)=>{
                if(arr[1].slice(-2,-1)===':'){
                    arr[1]+=arr[1].slice(-1);
                    arr[1][arr[1].length-2] = "0";
                }
                return String(dict[arr[0]]+" "+arr[1]+ " to " + arr[2]);
            }).join('\n');
            obj.data.push({field: "time_slots",content: time_slots});
            obj.data.push(obj.other_info[6]);
            return obj;
        })
        console.log(course_info[0].data)
        let sem = await get_current_semester();
        let current_year = sem['0']
        let current_semester = sem['1'];        
        //console.log(current_year,current_semester)
        let response = {
            isAuthenticated: true,
            course_info : course_info,
            prereqs : prereqs,
            current_year: current_year,
            current_semester: current_semester
        }
        //console.log(response)
       res.send(response);

    }
    else{
        res.send({isAuthenticated:false,msg:"Not loggin in"});
    }
})

app.get("/instructor/:instructor_id",async (req,res)=>{
    if(req.session.userID){
        let instructor_id = req.params.instructor_id;
        let sem = await get_current_semester();
        let current_year = sem['0']
        let current_semester = sem['1'];   
        let response = {
            isAuthenticated: true,
            basic_info: {},
            current_courses: {},
            previous_courses: {} 
        }
        let info = (await client.query(`
        select id,name,dept_name
        from instructor
        where id=$1
        `,[instructor_id])).rows[0];
        console.log(info);
        response.basic_info = [
            {
                field: "ID",
                content: info.id
            },
            {
                field: "Name",
                content: info.name
            },
            {
                field: "Department",
                content: info.dept_name
            }
        ]
        console.log(response.basic_info);
        response.current_courses = (await client.query(`
        select course.course_id,title,credits 
        from (teaches natural join instructor) join course on teaches.course_id=course.course_id
        where id=$1 and semester=$2 and year=$3
        order by course_id 
        `,[instructor_id,current_semester,current_year])).rows;
        console.log(response.current_courses)
        response.previous_courses = (await client.query(`
        select course.course_id,title,credits,semester,year 
        from (teaches natural join instructor) join course on teaches.course_id=course.course_id
        where id=$1 and (semester!=$2 or year!=$3)
        order by year desc,semester asc
        `,[instructor_id,current_semester,current_year])).rows;
        console.log(response.previous_courses)
        res.send(response);
    }
    else{
        res.send({isAuthenticated:false,msg:"Not logged in"});
    }
})


app.listen(PORT, () => {
    console.log(`Server is running on port 8000.`);
  });