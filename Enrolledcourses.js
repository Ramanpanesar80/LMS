import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "../Footer"; 

import Sidebar from "./Sidebar";

const EnrolledCourses = () => {
  const location = useLocation();
  const initialCourses = location.state?.enrolledCourses || []; 
  const [enrolledCourses, setEnrolledCourses] = useState(initialCourses);

  const handleWithdraw = (index) => {
    const updatedCourses = enrolledCourses.filter((_, i) => i !== index);
    setEnrolledCourses(updatedCourses); // Update state
  };

  return (
    <div className="container">
      <header className="header">
        <p>Welcome, user!</p>
        <div className="button-container">
          <button className="button">Student Profile</button>
          <button className="button logout">Sign Out</button>
        </div>
      </header>

     <Sidebar/>

      <main className="content">
        <h2>Enrolled Courses</h2>
        <div className="courses">
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course, index) => (
              <div key={index} className="course-card">
                <h3>{course.title}</h3>
                <p><strong>Teacher:</strong> {course.teacher}</p>
                <p>{course.description}</p>
                <button
                  className="button withdraw"
                  onClick={() => handleWithdraw(index)} 
                >
                  Withdraw
                </button>
              </div>
            ))
          ) : (
            <p>No courses enrolled yet.</p>
          )}
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default EnrolledCourses;
