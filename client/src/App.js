import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login"
import Home from "./components/Home"
import Registration from "./components/Registration"
import AllDeptCourses from "./components/AllDeptCourses";
import SingleDeptCourses from "./components/SingleDeptCourses";
import InstructorInfo from "./components/InstructorInfo";
import CourseInfo from "./components/CourseInfo";
import Init from "./components/InitPage"
import Logout from "./components/Logout"  
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Init/>} />
        <Route path="login" element={<Login />} />
        <Route path="logout" element={<Logout />} />
        <Route path="login" element={<Login />} />
        <Route path="home"> 
          <Route index element={<Home />} />
          <Route path="registration" element={<Registration />} />
        </Route>
        <Route path="course">
          <Route path=":course_id" element={<CourseInfo />} />
          <Route path="running">
            <Route index element={<AllDeptCourses />} />
            <Route path=":dept_name" element={<SingleDeptCourses />} />
          </Route>
        </Route>
        <Route path="instructor/:instructor_id" element={<InstructorInfo />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
