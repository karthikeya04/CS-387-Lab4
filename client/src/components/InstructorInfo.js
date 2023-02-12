import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
import { Center } from "./styles/mixins/Center";
import Table from "./kit/Table";

function InstructorInfo(){
    let navigate = useNavigate();
    let {instructor_id} = useParams();
    let [basicInfo,setBasicInfo] = useState(null);
    let [currentCourses,setCurrentCourses] = useState(null);
    let [previousCourses,setPreviousCourses] = useState(null);
    useEffect(()=>{
        axios 
        .get("/instructor/"+instructor_id)
        .then((res)=>{
            res=res.data;
            if(!res.isAuthenticated){
                navigate("/login");
                return;
            }
            res.current_courses = res.current_courses.map((obj)=>{
                obj["link"] = "/course/"+obj.course_id;
                return obj;
            })
            res.previous_courses = res.previous_courses.map(obj=>{
                obj["link"] = "/course/"+obj.course_id;
                return obj;
            })
            setBasicInfo(res.basic_info);
            setCurrentCourses(res.current_courses);
            setPreviousCourses(res.previous_courses);
        })
        .catch(err=>console.log(err));
    },[])
    return (
        <>
            <div className="dropdown" style={{position:"absolute",left:1300,top:30}}>
            <button className="dropbtn">  Instructor Page </button>
            <div className="dropdown-content">
            <a href="/home">Home</a>
            <a href="/logout">logout</a>
            </div>
            </div>

            {basicInfo ?
            <Center V H>
                <Table caption="" data={basicInfo} />
            </Center> 
        : <></>}
        {currentCourses&&currentCourses.length>0 ?
            <Center V H>
                <Table caption="Current Courses" data={currentCourses} />
            </Center> 
        : <></>}
        {previousCourses&&previousCourses.length>0 ?
            <Center V H>
                <Table caption="Previous Courses" data={previousCourses} />
            </Center> 
        : <></>}
        </>
    )
};

export default InstructorInfo;