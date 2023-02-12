import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
import "./styles/CourseInfo.css"
import { Center } from "./styles/mixins/Center";
import Table from "./kit/Table";


function CourseInfo(){
    let {course_id} = useParams();

    let [basicInfo,setbasicInfo] = useState(null);
    let [Iinfo,setIinfo] = useState(null);
    let navigate = useNavigate();
    console.log(course_id);
    useEffect(()=>{
        axios.get("/course/"+course_id)
        .then(res=>{
            res=res.data;
            console.log(res);
            if(!res.isAuthenticated){
                navigate("/login");
                return;
            }
            if(res.basic_info[3].content!=="None"){
                res.basic_info[3].content = res.basic_info[3].content.map((obj)=>{
                    obj["link"] = "/course/"+obj.course_id;
                    return obj;
                })
                res.basic_info[3].content =  (
                        <Table caption="" data={res.basic_info[3].content} />
                    )
            }
            res.instructors_info = res.instructors_info.map(obj=>{
                obj.instructors = obj.instructors.map((obj2)=>{
                    obj2["link"] = "/instructor/"+obj2.id;
                    return obj2;
                })
                obj.instructors = (
                    <Table caption="" data={obj.instructors} />
                )
                return obj;
            })

            setbasicInfo(res.basic_info);
            setIinfo(res.instructors_info);

            // res.course_info = res.course_info.map((arr)=>{
            //     arr.data.push({field: "Prerequisites",content: res.prereqs.length>0?(
                    
            //         <Table caption="" data={res.prereqs} />
                
            //     ): "None"})
            //     return arr;
            // })
            // console.log(res)
            // setCourseInfo(res.course_info)
            // // setYear(res.current_year);
            // // setSemester(res.current_semester);
            // setIdx(0);
        })
        .catch(err=>console.log(err))
    },[course_id]);
  
    return (
        <>
            <div className="dropdown" style={{position:"absolute",left:1300,top:30}}>
            <button className="dropbtn">  Course Page  </button>
            <div className="dropdown-content">
            <a href="/home">Home</a>
            <a href="/home/registration">Registration</a>
            </div>
            </div>
           {basicInfo ? 
            <Center V H>
                <Table caption="" data={basicInfo} />
            </Center> 
        : <></>
        }
        {Iinfo && Iinfo.length>0? 
            <Center V H>
                <Table caption="" data={Iinfo} />
            </Center> 
        : <></>
        }

        </>
    )
};

export default CourseInfo;