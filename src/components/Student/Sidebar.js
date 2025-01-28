import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ enrolledCourses }) => {
  return (
   <nav className="sidebart">
          <ul>
          <li><Link to="/studentdash">List of courses</Link></li>
            <li>
              <Link to="/enrolled-courses" state={{ enrolledCourses }}>
                Enrolled Courses
              </Link>
            </li>
            <li><Link to="/syllabus">Syllabus</Link></li>
            <li><Link to="/schedule">Course Schedule</Link></li>
            <li><Link to="/Student-discussion">Discussions</Link></li>
            <li><Link to="/assignmentsandquizzes">Assignments & Quiz</Link></li>
            <li><Link to="/graded">Grades</Link></li>
            <li><Link to="/course-documents">Course Documents</Link></li>
            <li><Link to="/report">Report</Link></li>
            <li><Link to="/attendance">Attendance</Link></li>
            <li><Link to="/notifications">Notifications</Link></li>
            <li><Link to="/studentnotificationsetup">Student Notification Setup</Link></li>
            <li> <Link to="/duedate">Duedate</Link>
          </li>
          </ul>
        </nav>
  );
};

export default Sidebar;
