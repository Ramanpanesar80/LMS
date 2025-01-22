import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Import Firestore
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"; // Import deleteDoc

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

  useEffect(() => {
    // Fetch documents from Firestore when component mounts or when data changes
    const fetchDocuments = async () => {
      const querySnapshot = await getDocs(collection(db, "documents"));
      const fileList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setFiles(fileList);
    };

    fetchDocuments(); // Call the function to fetch documents
  }, []); // Empty dependency array means this runs only once on mount

  const handleUploadClick = (course) => {
    setSelectedCourse(course);
    setShowUploadForm(true);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      // Save document metadata in Firestore
      await addDoc(collection(db, "documents"), {
        courseName: selectedCourse.name,
        title: newDocument.title,
        uploadedAt: new Date(),
        fileName: newDocument.file ? newDocument.file.name : "No file",
        fileContent: "", // You may store a URL for the file if you upload it to a storage solution
      });

      alert(`Document "${newDocument.title}" added successfully.`);

      // Fetch updated list of documents
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
      await deleteDoc(doc(db, "documents", id)); // Delete document from Firestore
      alert("Document deleted successfully.");

      // Fetch updated list of documents
      const querySnapshot = await getDocs(collection(db, "documents"));
      const fileList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setFiles(fileList);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  return (
    <div>
      <h1>Add New Document</h1>
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
    </div>
  );
};

export default EducatorDetails;
