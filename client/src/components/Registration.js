import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import Table from "./kit/Table";
import { Center } from "./styles/mixins/Center";
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import "./styles/Registration.css";

let secIDs = {};
let navigate;
let reload;

export function register(info){
    console.log(info)
    let sec_id = secIDs[info.course_id];
    let post_data = {
        course_id: info.course_id,
        title: info.title,
        sec_id: sec_id,
    }
    console.log(post_data);
    axios
    .post("/home/registration",post_data,{})
    .then(res=>{console.log(res.data); reload();})
    .catch(err=>console.log(err))

}

function Registration(){
    navigate = useNavigate();
    let [courses,setCourses] = useState([]);
    let [rows,setRows] = useState([]);
    let [items,setItems] = useState(null);
    reload = ()=>{
        console.log("In reload");
        window.location.reload(false);
    }

    
    useEffect(()=>{
        axios
        .get("/home/registration")
        .then(async (res)=>{
            console.log(res.data)
            if(!res.data.isAuthenticated){
                navigate("/login");
                return;
            }
            console.log(res.data.courses)
            res.data.courses = res.data.courses.map((obj)=>{
                obj["link"]="/course/"+obj.course_id;
                return obj;
            })
        
            setCourses(res.data.courses);
        })
        .catch(err=>console.log(err));
    },[]);

    function get_rows(data){
        let req_rows = data.map(obj=>{
            let ret = obj;
            let sec_options = obj.section.map(x=>{
                return {value: x,label: "S"+x};
            })
            ret.section = (
                    <Dropdown
                        placeHolder="Select..."
                        options={sec_options}
                        onChange={(value)=>{
                            secIDs[obj.course_id]=value.value;
                            }}
                    />
                )
            ret.Register = ""
            return ret;
        })   
        return req_rows;
    };
    useEffect(()=>{
        setRows(get_rows(courses));
    },[courses])
    useEffect(()=>{
        let idx = 0;
        let A = [];
        console.log(courses);
        courses.map((obj)=>{
            A.push({id:idx,name:obj.course_id+" : "+obj.title});
            idx++;
            return 0;
        })
        console.log(A)
        setItems(A);
    },[courses]);
      const handleOnSearch = (string, results) => {
        console.log(string, results);
        string=String(string).toLowerCase();
        console.log(courses)
        let matches = [];
        courses.map((obj)=>{
            if(String(obj.course_id).toLowerCase().includes(string) || String(obj.title).toLowerCase().includes(string)){
                matches.push(obj);
            }
            return 0;
        })
        console.log(matches)
        setRows(matches);
      };
    
      const handleOnHover = (result) => {
        console.log(result);
      };
    
      const handleOnSelect = (item) => {
        console.log(item);
      };
    
      const handleOnFocus = () => {
        console.log("Focused");
      };
    
      const handleOnClear = () => {
        console.log("Cleared");
      };
    return (
        <>
            <div className="dropdown" style={{position:"absolute",left:1300,top:30}}>
            <button className="dropbtn">  Registration  </button>
            <div className="dropdown-content">
            <a href="/home">Home</a>
            <a href="/course/running">Running Courses</a>
            </div>
            </div>
        {items && rows ? 
        <div className="App">
        <header className="App-header">
        <div style={{ width: 400, margin: 20 }}>
          <ReactSearchAutocomplete
            items={items}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
          />
          </div>
          </header>
          </div> 
          : <></>
        }
        {rows&&rows.length>=1 ? 
            <Center V H>
                <Table caption="Running Courses" data={rows} />
            </Center> 
        : <></>
        }
        </>
    )
};

export default Registration;