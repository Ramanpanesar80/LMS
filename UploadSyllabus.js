import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { collection, getDocs, updateDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; 
import { useNavigate, Link } from "react-router-dom"; 
import Footer from "../Footer"; 
import "./UploadSyllabus.css";



const EducatorSyllabusPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "syllabus"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSyllabusData(data);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a PDF or Word document.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFile({
          name: file.name,
          content: e.target.result,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (selectedFile && selectedSubject !== null) {
      try {
        setLoading(true);

        const subject = syllabusData[selectedSubject];
        const updatedSyllabus = syllabusData.map((item, index) =>
          index === selectedSubject
            ? { ...item, file: selectedFile.name, fileContent: selectedFile.content }
            : item
        );
        setSyllabusData(updatedSyllabus);

        const docRef = doc(db, "syllabus", subject.subject);
        await updateDoc(docRef, {
          file: selectedFile.name,
          fileContent: selectedFile.content,
        });

        alert(`Syllabus file "${selectedFile.name}" uploaded successfully!`);
        setSelectedFile(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please select a file and a subject.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/"); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="tt">
      <header className="head">
        <h1>Educator Dashboard</h1>
        <div className="header-right1">
          <button className="header2" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className="sidebar2">
        <ul>
          <li><Link to="/create-course">Create Courses</Link></li>
          <li><Link to="/assignments">Post Assignment</Link></li>
          <li><Link to="/grades">Post Grade</Link></li>
          <li><Link to="/viewsubmitassignments">View Submitted Assignments</Link></li>
          <li><Link to="/postquestion">Discussion</Link></li>
          <li><Link to="/report">Report</Link></li>
          <li><Link to="/post-course-docs">Post Course Docs</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/view-course">View Course</Link></li>
          <li><Link to="/upload-syllabus">Syllabus</Link></li>
          <li><Link to="/upload-schedule">Schedule</Link></li>
          <li><Link to="/upload-documents">course documents</Link></li>
        </ul>
      </div>

      <main className="ma">
        <div className="q">
          <h1>Syllabus</h1>
        </div>
        <table className="syllabus1">
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
                        Download
                      </a>
                    </>
                  ) : (
                    "No file uploaded"
                  )}
                </td>
                <td>
                  <button
                    className="btn3"
                    onClick={() => {
                      setSelectedSubject(index);
                      setIsModalOpen(true);
                    }}
                  >
                    Upload
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {isModalOpen && (
        <div className="modal1">
          <div className="modal-con">
            <h2>Upload New Syllabus for {syllabusData[selectedSubject]?.subject}</h2>
            <form className="upload-f" onSubmit={handleUpload}>
              <label htmlFor="upload-s">Choose File:</label>
              <input type="file" id="upload-s" onChange={handleFileChange} />
              {selectedFile && <p>Selected File: {selectedFile.name}</p>}
              <div className="modal-actions1">
                <button type="submit1" className="btnv">
                  Submit
                </button>
                <button
                  type="button"
                  className="btnk"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EducatorSyllabusPage;
