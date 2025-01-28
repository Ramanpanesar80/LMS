import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const StudentDetails = () => {
  const [documents, setDocuments] = useState({});
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "documents"), (querySnapshot) => {
      const docs = {};
      const courseNames = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const courseName = data.courseName;

        if (!docs[courseName]) docs[courseName] = [];
        docs[courseName].push({ id: doc.id, ...data });

        courseNames.add(courseName);
      });

      setDocuments(docs);
      setSubjects(Array.from(courseNames));
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {subjects.length > 0 ? (
        subjects.map((course) => (
          <div key={course}>
            <h2>{course}</h2>
            <table border="1">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Document Title</th>
                  <th>File Content</th>
                </tr>
              </thead>
              <tbody>
                {documents[course]?.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.courseName || "No Course Name"}</td>
                    <td>{doc.title || "No Title"}</td>
                    <td>{doc.fileContent || "No Content"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No subjects available</p>
      )}
    </div>
  );
};

export default StudentDetails;
