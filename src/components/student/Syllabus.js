import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Import your Firebase config
import { collection, getDocs } from "firebase/firestore"; // Firestore methods
// import "./Syllabus.css"; // Assuming you have a separate CSS file for styling

const StudentSyllabusPage = () => {
  const [syllabusData, setSyllabusData] = useState([]);

  useEffect(() => {
    // Fetch data from Firestore
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

  return (
    <div className="container">
      <header className="header">
        <div className="logo">LMS</div>
        <div className="user-actions">
          <button className="btn">Student Profile</button>
          <button className="btn">Sign out</button>
        </div>
      </header>

      <div className="content">
        <nav className="sidebar">
          <ul>
            <li>List Of Courses</li>
            <li>Enrolled Courses</li>
            <li className="upload-syllabus">Syllabus</li>
            <li>Course Schedule</li>
            <li>Discussions</li>
            <li>Assignments & Quiz</li>
            <li>Grades</li>
            <li>Course Documents</li>
            <li>Report</li>
            <li>Attendance</li>
            <li>Notification</li>
          </ul>
        </nav>

        <main className="main-content">
          <h1>Syllabus</h1>
          <p>Name: Student@one</p>

          <table className="syllabus-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Uploaded File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {syllabusData.map((item, index) => (
                <tr key={index}>
                  <td>{item.subject}</td>
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
                        <button className="btn">Download</button>
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
      </div>

      <footer className="footer">
        <p>About</p>
        <p>Privacy Policy</p>
        <p>Terms and Conditions</p>
        <p>Contact Us</p>
      </footer>
    </div>
  );
};

export default StudentSyllabusPage; 