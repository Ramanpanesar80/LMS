import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar1">
           <ul>
             <li><Link to="/create-course">Create Courses</Link></li>
             <li><Link to="/assignments">Post Assignment</Link></li>
             <li><Link to="/grades">Post Grade</Link></li>
             <li><Link to="/viewsubmitassignments">View Submitted Assignments</Link></li>
             <li><Link to="/postquestion">Discussion</Link></li>
             <li><Link to="/report">Report</Link></li>
             <li><Link to="/attendance">Attendance</Link></li>
             <li><Link to="/view-course">View Course</Link></li>
             <li><Link to="/upload-syllabus">Syllabus</Link></li>
             <li><Link to="/upload-schedule">Schedule</Link></li>
             <li><Link to="/upload-documents">course documents</Link></li>
             
   
           </ul>
         </div>
    
  );
};

export default Sidebar;
