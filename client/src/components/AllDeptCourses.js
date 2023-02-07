import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Center } from "./styles/mixins/Center";
import Table from "./kit/Table";


function AllDeptCourses(){
    let navigate = useNavigate();
    let [deptInfo,setDeptInfo] = useState(null);
    useEffect(()=>{
        axios 
        .get("/course/running")
        .then(res=>{
            res=res.data;
            console.log(res);
            if(!res.isAuthenticated){
                navigate("/login");
                return;
            }
            res.depts_info = res.depts_info.map((obj)=>{
                obj["link"] = "/course/running/"+obj.department;
                return obj;
            })
            console.log(res.depts_info)
            setDeptInfo(res.depts_info);
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

export default AllDeptCourses;