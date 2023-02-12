import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Home.css"
import Table from "./kit/Table";
import { Center } from "./styles/mixins/Center";
import {NavDropdown} from 'react-bootstrap'
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function drop(item){
    axios.post("/home",item,{})
    .then(res=>{
        res=res.data;
        console.log(res);
        // if(res.success){
        //     toast.success("Successfully dropped")
        // }
        window.location.reload(false);
    })
    .catch(err=>console.log(err));
}
function Home(){
    let navigate = useNavigate();
    let [userInfo,setuserInfo] = useState("");
    let [currSemInfo,setcurrSemInfo] = useState([]);
    let [prevSemInfo,setprevSemInfo] = useState([]);
    useEffect(()=>{
        axios.get("/home")
        .then(res=>{
            console.log(res.data)
            if(!res.data.isAuthenticated){
                navigate("/login");
                return;
            }
            res.data.current_sem.courses = res.data.current_sem.courses.map((obj)=>{
                obj.Drop="";
                obj["link"]="/course/"+obj.course_id;
                return obj;
            })
            res.data.previous_sems = res.data.previous_sems.map((obj)=>{
                obj.courses = obj.courses.map((obj2)=>{
                    obj2["link"] = "/course/"+obj2.course_id;
                    return obj2;
                })
                return obj;
            })
            console.log(res.data.current_sem.courses);
            let ui = [
                {
                    "field" : "ID",
                    "content": res.data.userInfo.id
                },
                {
                    "field" : "Name",
                    "content": res.data.userInfo.name
                },
                {
                    "field" : "Department",
                    "content": res.data.userInfo.dept_name
                },
                {
                    "field" : "Total credits",
                    "content": res.data.userInfo.tot_cred
                },
            ]
            setuserInfo(ui);
            setcurrSemInfo(res.data.current_sem);
            setprevSemInfo(res.data.previous_sems);

        }
        )
        .catch(err=>console.log(err))
            ;
    },[])
    
    return (
        <>
          <ToastContainer 
                autoClose={3000}
            />

            <div className="dropdown" style={{position:"absolute",left:1300,top:30}}>
            <button className="dropbtn">  Home  </button>
            <div className="dropdown-content">
            <a href="/course/running">Runnning Courses</a>
            <a href="/home/registration">Registration</a>
            <a href="/logout">logout</a>
            </div>
            </div>
   
        <div className="App">
            <div>
            {
                userInfo ? 
                <Center V H>
                <Table caption={""} data={userInfo} />
                </Center> : <></>
            }
            { currSemInfo.courses&&currSemInfo.courses.length>0? 
            <>
            <Center V H>
                <Table caption={currSemInfo.semester+" "+currSemInfo.year} data={currSemInfo.courses} />
            </Center> 
            </>
            :
            <></>
            }
            { currSemInfo.courses && prevSemInfo?
            prevSemInfo.map((obj) => {return obj.courses.length>0 ? (
            <Center V H>
                <Table data={obj.courses} caption={obj.semester+" "+obj.year}/>
            </Center>): <></>})
            :
            <></>
            }
            </div>
        </div>
        </>
    )
};

export default Home;