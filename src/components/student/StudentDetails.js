import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase"; // Import Firestore and Storage
import { collection, onSnapshot } from "firebase/firestore";
// import { FaFileAlt } from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage functions for upload
import { doc, setDoc } from "firebase/firestore"; // Firestore functions for upload and update

const StudentDetails = () => {
  const [documents, setDocuments] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors

  const subjects = [
    { name: "Introduction to Cybersecurity", key: "Introduction to Cybersecurity" },
    { name: "Network Security", key: "Network Security" },
    { name: "Cloud Security", key: "Cloud Security" },
    { name: "Operating System Security", key: "Operating System Security" },
  ];

  useEffect(() => {
    // Real-time updates from Firestore
    const unsubscribe = onSnapshot(collection(db, "documents"), (querySnapshot) => {
      const docs = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Document Data from Firestore:", data); // Log the raw data from Firestore
        if (!docs[data.courseName]) docs[data.courseName] = [];
        docs[data.courseName].push({ id: doc.id, ...data });
      });
      console.log("Documents State after fetching:", docs); // Log the state after fetching from Firestore
      setDocuments(docs);
      setLoading(false);
    }, (err) => {
      setError("Error fetching documents: " + err.message); // Handle Firestore fetch error
      setLoading(false);
    });

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
      // Upload the file to Firebase Storage
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // Save document details in Firestore
      const docRef = doc(db, "documents", file.name); // Use a unique identifier like the filename
      await setDoc(docRef, {
        courseName,
        title,
        filename: file.name,
        fileUrl,
      });

      // Update local state to include the new document immediately
      setDocuments((prevDocs) => ({
        ...prevDocs,
        [courseName]: [...(prevDocs[courseName] || []), {
          id: file.name,
          title,
          filename: file.name,
          fileUrl,
        }],
      }));

      console.log("File uploaded successfully!");
    } catch (error) {
      setError("Error uploading file: " + error.message); // Handle file upload error
      console.error("Error uploading file: ", error);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p> // Display error if any
      ) : !selectedCourse ? (
        <div>
          <h1>Course Documents</h1>
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
                    style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
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
          <h1>{selectedCourse}</h1>
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
                      {/* <FaFileAlt /> {doc.title || "No Title"} */}
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
  );
};

export default StudentDetails;
