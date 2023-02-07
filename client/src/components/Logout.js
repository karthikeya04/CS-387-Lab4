import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login(){
    let navigate = useNavigate();
    useEffect(()=>{
        axios
        .get("/logout")
        .then((res)=>{
            console.log(res);
            navigate("/login");
        })
        .catch(err=>console.log(err));
    })
}
export default Login;