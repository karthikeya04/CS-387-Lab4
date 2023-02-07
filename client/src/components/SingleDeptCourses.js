import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
import { Center } from "./styles/mixins/Center";
import Table from "./kit/Table";

function SingleDeptCourses(){
    let {dept_name} = useParams();
    let navigate = useNavigate();
    let [deptInfo,setDeptInfo] = useState(null);
    useEffect(()=>{
        console.log(dept_name);
        axios 
        .get("/course/running/"+dept_name)
        .then(res=>{
            res=res.data;
            console.log(res);
            if(!res.isAuthenticated){
                navigate("/login");
                return;
            }
            res.courses = res.courses.map((obj)=>{
                obj["link"] = "/course/"+obj.course_id;
                return obj;
            })
            setDeptInfo(res.courses);
        })
        .catch(err=>console.log(err));
    },[]);
    return (
        <>
            <div className="dropdown" style={{position:"absolute",left:1300,top:30}}>
            <button className="dropbtn">  Running Courses </button>
            <div className="dropdown-content">
            <a href="/home">Home</a>
            <a href="/logout">logout</a>
            </div>
            </div>
    {deptInfo ? 
            <Center V H>
                <Table caption="" data={deptInfo} />
            </Center> 
        : <></>}
        </>
    )
};

export default SingleDeptCourses;