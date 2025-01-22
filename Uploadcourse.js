import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./Uploadcourse.css";

import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import Footer from "../Footer";  

const EducatorDetails = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newDocument, setNewDocument] = useState({ title: "", file: null });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [files, setFiles] = useState([]);

  const courses = [
    { name: "Introduction to Cybersecurity" },
    { name: "Network Security" },
    { name: "Cloud Security" },
    { name: "Operating System Security" },
  ];
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(() => {
    const fetchDocuments = async () => {
      const querySnapshot = await getDocs(collection(db, "documents"));
      const fileList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setFiles(fileList);
    };

    fetchDocuments();
  }, []);

  const handleUploadClick = (course) => {
    setSelectedCourse(course);
    setShowUploadForm(true);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      await addDoc(collection(db, "documents"), {
        courseName: selectedCourse.name,
        title: newDocument.title,
        uploadedAt: new Date(),
        fileName: newDocument.file ? newDocument.file.name : "No file",
        fileContent: "",
      });

      alert(`Document "${newDocument.title}" added successfully.`);
      const querySnapshot = await getDocs(collection(db, "documents"));
      const fileList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setFiles(fileList);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document. Please try again.");
    } finally {
      setShowUploadForm(false);
      setSelectedCourse(null);
      setNewDocument({ title: "", file: null });
    }
  };

  const handleCancel = () => {
    setShowUploadForm(false);
    setSelectedCourse(null);
    setNewDocument({ title: "", file: null });
  };

  const deleteDocument = async (id) => {
    try {
      await deleteDoc(doc(db, "documents", id));
      alert("Document deleted successfully.");
      const querySnapshot = await getDocs(collection(db, "documents"));
      const fileList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setFiles(fileList);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
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
    <div>
      <header className="head">
        <h1>Educator Dashboard</h1>
        <div className="header-right1">
          <button className="header2" onClick={() => alert("Sign out not implemented")}>
            Sign out
          </button>
        </div>
      </header>
      
      <div className="sidebar3">
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
      <h1 className="ll">Add New Document</h1>
      <table className="course-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Add Document</th>
            <th>Uploaded Document</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={index}>
              <td>{course.name}</td>
              <td>
                <button onClick={() => handleUploadClick(course)}>Upload</button>
              </td>
              <td>
                {files
                  .filter((fileItem) => fileItem.courseName === course.name)
                  .map((fileItem, fileIndex) => (
                    <div key={fileIndex}>
                      {fileItem.fileName !== "No file" ? (
                        <div>
                          <a href={fileItem.fileContent} download={fileItem.fileName}>
                            Download
                          </a>
                          <br />
                          <span>File Name: {fileItem.fileName}</span>
                          <button onClick={() => deleteDocument(fileItem.id)}>
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span>No file uploaded</span>
                      )}
                    </div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showUploadForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Document for {selectedCourse.name}</h2>
            <form onSubmit={handleFormSubmit}>
              <label>
                Document Title:
                <input
                  type="text"
                  value={newDocument.title}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, title: e.target.value })
                  }
                  required
                />
              </label>
              <br />
              <label>
                Upload Document:
                <input
                  type="file"
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, file: e.target.files[0] })
                  }
                />
                <span>{newDocument.file ? newDocument.file.name : "No file chosen"}</span>
              </label>
              <br />
              <button type="submit">Submit</button>
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default EducatorDetails;
