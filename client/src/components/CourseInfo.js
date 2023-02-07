import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
import "./styles/CourseInfo.css"
import { Center } from "./styles/mixins/Center";
import Table from "./kit/Table";


function CourseInfo(){
    let {course_id} = useParams();
    let [year,setYear] = useState(null);
    let [semester,setSemester] = useState(null);
    let [courseInfo,setCourseInfo] = useState(null);
    let [idx,setIdx] = useState(0);
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
            res.prereqs = res.prereqs.map((obj)=>{
                obj["link"] = "/course/"+obj.course_id;
                return obj;
            })
            res.course_info = res.course_info.map((arr)=>{
                arr.data[7] = arr.data[7].map((obj)=>{
                    obj["link"] = "/instructor/"+obj.id;
                    return obj;
                })
                arr.data[7] = {
                    field: "Instructor(s)",
                    content: (
                        <Table caption="" data={arr.data[7]} />
                    )
                }
                return arr;
            })
            res.course_info = res.course_info.map((arr)=>{
                arr.data.push({field: "Prerequisites",content: res.prereqs.length>0?(
                    
                    <Table caption="" data={res.prereqs} />
                
                ): "None"})
                return arr;
            })
            console.log(res)
            setCourseInfo(res.course_info)
            setYear(res.current_year);
            setSemester(res.current_semester);
            setIdx(0);
        })
        .catch(err=>console.log(err));
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
           {courseInfo && idx>=0 ? 
            <Center V H>
                <Table caption="" data={courseInfo[idx].data} />
            </Center> 
        : <></>
        }

        </>
    )
};

export default CourseInfo;