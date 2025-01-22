import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Import Firestore
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const Adminview = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    
    const fetchDocuments = async () => {
      const querySnapshot = await getDocs(collection(db, "documents"));
      const documentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocuments(documentList);
    };

    fetchDocuments(); 
  }, []); 

  const handleDelete = async (documentId) => {
    try {
     
      await deleteDoc(doc(db, "documents", documentId));
      
     
      setDocuments(documents.filter((document) => document.id !== documentId));

      alert("Document deleted successfully.");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      <table className="document-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Document Title</th>
            <th>Uploaded At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>{document.courseName}</td>
              <td>{document.title}</td>
              <td>
                {document.uploadedAt ? 
                  new Date(document.uploadedAt.toDate()).toLocaleString() : 
                  "No date available"
                }
              </td>
              <td>
                <button
                  onClick={() => handleDelete(document.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Adminview;
