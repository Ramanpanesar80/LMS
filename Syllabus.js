import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { collection, getDocs } from "firebase/firestore"; 
import { getAuth, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import "./Syllabus.css"; 
import Footer from "../Footer"; 
import Sidebar from "./Sidebar";

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

      <div className="c">
        <Sidebar />

        <main className="main-con">
          <h1 className="p">Syllabus</h1>

          <table className="syllabus-tableu">
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
                        <a href={item.fileContent} download={item.file}></a>
                      </>
                    ) : (
                      "No file uploaded"
                    )}
                  </td>
                  <td>
                    {item.file && item.fileContent ? (
                      <a href={item.fileContent} download={item.file}>
                        <button className="btn2">Download</button>
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

      <Footer />
    </div>
  );
};

export default StudentSyllabusPage;
