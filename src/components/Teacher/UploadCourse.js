import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Import Firestore
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"; // Firestore methods

const StudentDocuments = () => {
  const [newDocument, setNewDocument] = useState({ title: "", fileName: "", fileContent: "" });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]); // Dynamically fetched courses

  // Fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
        alert("Failed to fetch courses. Please try again.");
      }
    };

    fetchCourses();
  }, []);

  // Fetch documents from Firestore
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "documents"));
        const documentList = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setDocuments(documentList);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  // Handle adding a new document
  const handleAddDocument = async (course) => {
    try {
      await addDoc(collection(db, "documents"), {
        title: newDocument.title,
        courseId: course.id,
        fileContent: newDocument.fileContent,
        courseName: course.title,
      });
      setNewDocument({ title: "",  fileContent: "" });
      // Update the documents after adding a new one
      const querySnapshot = await getDocs(collection(db, "documents"));
      const documentList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setDocuments(documentList);
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to add document. Please try again.");
    }
  };

  // Handle deleting a document
  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDoc(doc(db, "documents", documentId));
      const updatedDocuments = documents.filter((document) => document.id !== documentId);
      setDocuments(updatedDocuments);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  return (
    <div>
      <h1>Student Documents</h1>
      <table className="course-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Add Document</th>
            <th>Uploaded Documents</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>
                <button onClick={() => setSelectedCourse(course)}>Add Document</button>
              </td>
              <td>
                {documents
                  .filter((documentItem) => documentItem.courseId === course.id)
                  .map((documentItem) => (
                    <div key={documentItem.id}>
                      {documentItem.fileName !== "No file" ? (
                        <div>
                          <span>File Tile: {documentItem.title}</span>
                          <div>
                            <span>Content:{documentItem.fileContent}</span>
                            
                          </div>
                          <button onClick={() => handleDeleteDocument(documentItem.id)}>Delete</button>
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

      {/* Form for adding a new document */}
      {selectedCourse && (
        <div>
          <h2>Add Document for {selectedCourse.title}</h2>
          <input
            type="text"
            placeholder="Document Title"
            value={newDocument.title}
            onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
          />
          <textarea
            placeholder="File Content"
            value={newDocument.fileContent}
            onChange={(e) => setNewDocument({ ...newDocument, fileContent: e.target.value })}
          />
          <button onClick={() => handleAddDocument(selectedCourse)}>Save Document</button>
        </div>
      )}
    </div>
  );
};

export default StudentDocuments;
