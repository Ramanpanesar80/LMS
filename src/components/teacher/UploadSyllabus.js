import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Firebase configuration file
import { collection, getDocs, updateDoc, doc, setDoc } from "firebase/firestore"; // Firestore functions
// import "./UploadSyllabus.css";

const EducatorSyllabusPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [syllabusData, setSyllabusData] = useState([]);

  const predefinedSubjects = [
    { subject: "Introduction to Cybersecurity", file: null, fileContent: null },
    { subject: "Network Security", file: null, fileContent: null },
    { subject: "Cloud Security", file: null, fileContent: null },
    { subject: "Operating System Security", file: null, fileContent: null },
  ];

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "syllabus"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (data.length > 0) {
        setSyllabusData(data);
      } else {
        // Initialize Firestore with predefined subjects
        predefinedSubjects.forEach(async (subject) => {
          await setDoc(doc(db, "syllabus", subject.subject), subject);
        });
        setSyllabusData(predefinedSubjects);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedFile({
        name: file.name,
        content: e.target.result, // Base64-encoded file content
      });
    };

    reader.readAsDataURL(file); // Read file as Base64
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (selectedFile && selectedSubject !== null) {
      try {
        const subject = syllabusData[selectedSubject];

        const updatedSyllabus = syllabusData.map((item, index) =>
          index === selectedSubject
            ? { ...item, file: selectedFile.name, fileContent: selectedFile.content }
            : item
        );
        setSyllabusData(updatedSyllabus);

        // Update Firestore
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
      }
    } else {
      alert("Please select a file and a subject.");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">LMS</div>
        <div className="user-actions">
          <button className="btn">Educator Profile</button>
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
          <p>Name: Educator@one</p>

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
                        <a
                          href={item.fileContent}
                          download={item.file}
                        >
                         Download
                        </a>
                      </>
                    ) : (
                      "No file uploaded"
                    )}
                  </td>
                  <td>
                    <button
                      className="btn"
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
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Upload New Syllabus for {syllabusData[selectedSubject]?.subject}</h2>
            <form className="upload-form" onSubmit={handleUpload}>
              <label htmlFor="upload-syllabus">Choose File:</label>
              <input type="file" id="upload-syllabus" onChange={handleFileChange} />
              {selectedFile && <p>Selected File: {selectedFile.name}</p>}
              <div className="modal-actions">
                <button type="submit" className="btn">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn"
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

      <footer className="footer">
        <p>About</p>
        <p>Privacy Policy</p>
        <p>Terms and Conditions</p>
        <p>Contact Us</p>
      </footer>
    </div>
  );
};

export default EducatorSyllabusPage;



