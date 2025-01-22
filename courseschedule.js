import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Footer"; 
import "./CourseSchedule.css";
import Sidebar from "./Sidebar"; 

const CourseSchedule = ({ userId }) => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [scheduleFiles, setScheduleFiles] = useState([]);

  const auth = getAuth(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!userId) {
      console.error("User ID is not defined!");
      return; 
    }

    const fetchScheduleFiles = async () => {
      try {
        const q = query(
          collection(db, "courseSchedules"),
          where("year", "==", selectedYear)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const fileList = querySnapshot.docs.map((doc) => doc.data());
          console.log("Fetched schedules:", fileList);
          setScheduleFiles(fileList);
        } else {
          console.log("No schedules found for this year.");
          setScheduleFiles([]);
        }
      } catch (error) {
        console.error("Error fetching schedule files: ", error);
      }
    };

    fetchScheduleFiles();
  }, [selectedYear, userId]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  if (!userId) {
    return <p>User not logged in</p>;
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/"); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="sim">
      <header className="head">
        <h1>Student Dashboard</h1>
        <div className="button-con">
          <button className="btn">
            <Link to="/studentDash">Student Profile</Link>
          </button>
          <button className="button1 logout1" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>
      <Sidebar/>

      <div className="f">
      <h2 className="d">Course Schedule for {selectedYear}</h2><br/>
        <div className="year-selector1">
          <label htmlFor="year1">Select Year: </label>
          <select id="year1" value={selectedYear} onChange={handleYearChange}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        
        {scheduleFiles.length > 0 ? (
          <div className="schedule-table2">
            <table>
              <thead>
                <tr>
                  <th>Schedule</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scheduleFiles.map((file) => (
                  <tr key={file.fileName}>
                    <td>{file.fileName}</td>
                    <td>
                      {file.fileContent ? (
                        <a href={file.fileContent} download={file.fileName}>
                          <button className="btnf">Download</button>
                        </a>
                      ) : (
                        "No download available"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No schedules available for {selectedYear}.</p>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default CourseSchedule;
