import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Init(){
    let navigate = useNavigate();
    useEffect(()=>{
        navigate("/login");
    },[]);
}
export default Init;