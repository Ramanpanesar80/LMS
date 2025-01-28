import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { collection, getDocs } from "firebase/firestore"; 
import "./Syllabus.css"; 
import Footer from "../Footer";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const StudentSyllabusPage = () => {
  const [syllabusData, setSyllabusData] = useState([]);
   const navigate = useNavigate();
    const auth = getAuth();

  useEffect(() => {
  const fetchSyllabusData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "syllabus")); 
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSyllabusData(data); 
      } catch (error) {
        console.error("Error fetching syllabus data:", error);
      }
    };

    fetchSyllabusData();
  }, []); 
   const handleSignOut = async () => {
      try {
        await signOut(auth);
        navigate("/");
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
      }
    };

  return (
    <div className="syll">

<header className="list-header">
        <h1 className="preet">Student Dashboard</h1>
        <div className="button-list">
          <button className="btn-list">
            <Link to="/ViewProfile">Student Profile</Link>
          </button>
        
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

<nav className="sidebar-syllabus">
              <ul>
              <li><Link to="/studentdash">List of courses</Link></li>
                <li>
                  <Link to="/enrolled-courses">
                    Enrolled Courses
                  </Link>
                </li>
                <li><Link to="/syllabus">Syllabus</Link></li>
                <li><Link to="/schedule">Course Schedule</Link></li>
                <li><Link to="/discussions">Discussions</Link></li>
                <li><Link to="/assignmentsandquizzes">Assignments & Quiz</Link></li>
                <li><Link to="/graded">Grades</Link></li>
                <li><Link to="/course-documents">Course Documents</Link></li>
               <li><Link to="/attendance">Attendance</Link></li>
                <li><Link to="/notifications">Notifications</Link></li>
              
              </ul>
            </nav>
    
        <main className="main-sy">
          <h1 className="syl-h">Syllabus</h1>

          <table className="syllabus-tablu">
            <thead>
              <tr>
                <th>Course Title</th> 
                <th>Uploaded File</th> 
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {syllabusData.map((item, index) => (
                <tr key={index}>
                  <td>{item.courseName}</td> 
                  <td>
                    {item.file ? (
                      <>
                        {item.file}{" "}
                        <a href={item.fileContent} download={item.file}>
                          
                        </a>
                      </>
                    ) : (
                      "No file uploaded"
                    )}
                  </td>
                  <td>
                    {item.file && item.fileContent ? (
                      <a href={item.fileContent} download={item.file}>
                        <button className="btn-sy">Download</button>
                      </a>
                    ) : (
                      "No download available"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
    

      <Footer/>
    </div>
  );
};

export default StudentSyllabusPage;
