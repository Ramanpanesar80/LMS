import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import Homepage from "./components/Home";
import StudentLogin from "./components/StudentLogin";
import TeacherLogin from "./components/TeacherLogin";
import ForgotPassword from "./ForgotPassword";
import SignUp from "./components/SignUp";
import StudentDash from "./components/Student/StudentDash";
import EnrolledCourses from "./components/Student/EnrolledCourses";
import StudentProfile from "./components/Student/StudentProfile";
import CreateCourses from "./components/Teacher/CreateCourses";
import AdminDashboard from "./components/Admin/AdminDash";
import ViewCourses from "./components/Teacher/VierCourses";
import Assignments from "./components/Teacher/Assignments";

import "./App.css";

function App() {
  const [courses, setCourses] = useState([]);

  const addCourse = (course) => {
    setCourses((prevCourses) => [...prevCourses, course]);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/educator" element={<TeacherLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/studentdash" element={<StudentDash courses={courses} />} />
        <Route path="/create-course" element={<CreateCourses addCourse={addCourse} />} />
        <Route path="/view-course" element={<ViewCourses />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/enrolled-courses" element={<EnrolledCourses />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
