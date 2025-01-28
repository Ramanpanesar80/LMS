import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./StudentDetails.css";

const StudentDetails = () => {
  const [documents, setDocuments] = useState({});
  const [subjects, setSubjects] = useState([]);
  const auth = getAuth();
 
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "documents"), (querySnapshot) => {
      const docs = {};
      const courseNames = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const courseName = data.courseName;

        if (!docs[courseName]) docs[courseName] = [];
        docs[courseName].push({ id: doc.id, ...data });

        courseNames.add(courseName);
      });

      setDocuments(docs);
      setSubjects(Array.from(courseNames));
    });

   
    return () => unsubscribe();
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
    <div className="doc">
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

      <nav className="sidebar-doc">
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
            <div className="documents">
      {subjects.length > 0 ? (
        subjects.map((course) => (
          <div key={course}>
            <h2 className="docuh">{course}</h2>
            <table border="1" className="documents-t">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Document Title</th>
                  <th>File Content</th>
                </tr>
              </thead>
              <tbody>
                {documents[course]?.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.courseName || "No Course Name"}</td>
                    <td>{doc.title || "No Title"}</td>
                    <td>{doc.fileContent || "No Content"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No subjects available</p>
      )}
    </div>
    <footer className="footer-docu">
      <a href="#" className="footer-link-docu">About Us</a>
      <a href="#" className="footer-link-docu">Privacy Policy</a>
      <a href="#" className="footer-link-docu">Terms and Conditions</a>
      <a href="#" className="footer-link-docu">Contact Us</a>
    </footer>
    </div>
  );
};

export default StudentDetails;
