import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase"; 
import { collection, onSnapshot } from "firebase/firestore";
import { FaFileAlt } from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { doc, setDoc } from "firebase/firestore"; 
import { Link } from "react-router-dom"; 
import "./StudentDetails.css";
import Sidebar from "./Sidebar";
import Footer from "../Footer"; 

const StudentDetails = () => {
  const [documents, setDocuments] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const subjects = [
    { name: "Introduction to Cybersecurity", key: "Introduction to Cybersecurity" },
    { name: "Network Security", key: "Network Security" },
    { name: "Cloud Security", key: "Cloud Security" },
    { name: "Operating System Security", key: "Operating System Security" },
  ];

  useEffect(() => {
    
    const unsubscribe = onSnapshot(
      collection(db, "documents"),
      (querySnapshot) => {
        const docs = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Document Data from Firestore:", data); 
          if (!docs[data.courseName]) docs[data.courseName] = [];
          docs[data.courseName].push({ id: doc.id, ...data });
        });
        console.log("Documents State after fetching:", docs); 
        setDocuments(docs);
        setLoading(false);
      },
      (err) => {
        setError("Error fetching documents: " + err.message); 
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubjectClick = (courseKey) => {
    setSelectedCourse(courseKey);
  };

  const totalDocsForSubject = (subjectKey) => documents[subjectKey]?.length || 0;
  const courseDocs = selectedCourse ? documents[selectedCourse] : [];

  const uploadFile = async (file, courseName, title) => {
    const fileRef = ref(storage, `documents/${courseName}/${file.name}`);

    try {
     
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

     
      const docRef = doc(db, "documents", file.name); 
      await setDoc(docRef, {
        courseName,
        title,
        filename: file.name,
        fileUrl,
      });

     
      setDocuments((prevDocs) => ({
        ...prevDocs,
        [courseName]: [
          ...(prevDocs[courseName] || []),
          {
            id: file.name,
            title,
            filename: file.name,
            fileUrl,
          },
        ],
      }));

      console.log("File uploaded successfully!");
    } catch (error) {
      setError("Error uploading file: " + error.message); 
      console.error("Error uploading file: ", error);
    }
  };

  const handleSignOut = () => {
    
    console.log("Sign-out logic here");
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
      <Sidebar />
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p> 
        ) : !selectedCourse ? (
          <div>
            <h1 className="happy">Course Documents</h1>
            <table border="1">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Total Documents</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                      onClick={() => handleSubjectClick(subject.key)}
                    >
                      {subject.name}
                    </td>
                    <td>{totalDocsForSubject(subject.key) || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <h1 classnmae="aap">{selectedCourse}</h1>
            <button onClick={() => setSelectedCourse(null)}>Back to Courses</button>
            {courseDocs.length > 0 ? (
              <table border="1">
                <thead>
                  <tr>
                    <th>Document Title</th>
                    <th>Filename</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courseDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <FaFileAlt /> {doc.title || "No Title"}
                      </td>
                      <td>{doc.filename || "No Filename"}</td>
                      <td>
                        {doc.fileUrl ? (
                          <a href={doc.fileUrl} download>
                            <button>Download</button>
                          </a>
                        ) : (
                          <span>No download available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No documents available for this course.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StudentDetails;
