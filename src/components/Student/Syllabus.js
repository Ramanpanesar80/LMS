import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Import your Firebase config
import { collection, getDocs } from "firebase/firestore"; // Firestore methods
import "./Syllabus.css"; // Assuming you have a separate CSS file for styling

const StudentSyllabusPage = () => {
  const [syllabusData, setSyllabusData] = useState([]);

  useEffect(() => {
    // Fetch data from Firestore (syllabus collection)
    const fetchSyllabusData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "syllabus")); // Fetch from the "syllabus" collection
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSyllabusData(data); // Set data to state
      } catch (error) {
        console.error("Error fetching syllabus data:", error);
      }
    };

    fetchSyllabusData();
  }, []); // Empty dependency array to run this only once when the component mounts

  return (
    <div className="sy">
      <div className="lm">
        <main className="main3">
          <h1>Syllabus</h1>

          <table className="syllabus-table1">
            <thead>
              <tr>
                <th>Course Title</th> {/* Column for course title */}
                <th>Uploaded File</th> {/* Column for uploaded file */}
                <th>Actions</th> {/* Column for actions like download */}
              </tr>
            </thead>
            <tbody>
              {syllabusData.map((item, index) => (
                <tr key={index}>
                  <td>{item.courseName}</td> {/* Display course name */}
                  <td>
                    {item.file ? (
                      <>
                        {item.file}{" "}
                        <a href={item.fileContent} download={item.file}>
                          {/* Add download functionality */}
                        </a>
                      </>
                    ) : (
                      "No file uploaded"
                    )}
                  </td>
                  <td>
                    {item.file && item.fileContent ? (
                      <a href={item.fileContent} download={item.file}>
                        <button className="btn">Download</button>
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

      <footer className="footer">
        <p>About</p>
        <p>Privacy Policy</p>
        <p>Terms and Conditions</p>
        <p>Contact Us</p>
      </footer>
    </div>
  );
};

export default StudentSyllabusPage;
