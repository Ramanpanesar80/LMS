
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./StudentDash.css";

const StudentDashboard = ({ courses: initialCourses = [] }) => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courses] = useState([
    ...initialCourses,
    {
      title: "Cyber Security",
      description:
        "Protecting systems, networks, data, and information from evolving digital threats.",
      image: require("./images1/t3.jpg"), 
    },
    {
      title: "Web Designer",
      description:
        "Designs visually appealing, user-friendly websites with functionality.",
      image: require("./images1/t4.jpg"), 
    },
    {
      title: "Software Developer",
      description:
        "Builds and maintains websites, ensuring functionality and performance.",
      image: require("./images1/t5.jpg"),
    },
  ]);

  const handleEnroll = (course) => {
    if (!enrolledCourses.some((enrolled) => enrolled.title === course.title)) {
      const updatedCourses = [...enrolledCourses, course];
      setEnrolledCourses(updatedCourses);
      alert(`You have enrolled in ${course.title}!`);
    } else {
      alert(`You are already enrolled in ${course.title}.`);
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/Homepage");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Student Dashboard</h1>
        <div className="button-container">
          <button className="button"><Link to="/StudentProfile">Student Profile</Link></button>
          <button className="button logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <nav className="sidebar">
        <ul>
          <li>List of Courses</li>
          <li>
            <Link to="/enrolled-courses" state={{ enrolledCourses }}>
              Enrolled Courses
            </Link>
          </li>
          <li><Link to="/syllabus">Syllabus</Link></li>
          <li><Link to="/schedule">Course Schedule</Link></li>
          <li><Link to="/discussions">Discussions</Link></li>
          <li><Link to="/assignments">Assignments & Quiz</Link></li>
          <li><Link to="/grades">Grades</Link></li>
          <li><Link to="/course-documents">Course Documents</Link></li>
          <li><Link to="/report">Report</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/notification">Notification</Link></li>
        </ul>
      </nav>

      <main className="content">
        <h2 className="heading">List of Courses</h2>
        <div className="courses">
          {courses.map((course, index) => (
            <div key={index} className="course-card">
              <img src={course.image} alt={course.title} />
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <button
                className="button enroll"
                onClick={() => handleEnroll(course)}
              >
                Enroll
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer1">
        <a href="#" className="footer-link">
          About Us
        </a>
        <a href="#" className="footer-link">
          Privacy Policy
        </a>
        <a href="#" className="footer-link">
          Terms and Conditions
        </a>
        <a href="#" className="footer-link">
          Contact Us
        </a>
      </footer>
    </div>
  );
};

export default StudentDashboard;
