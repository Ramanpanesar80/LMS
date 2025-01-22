import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Firebase configuration
import { useNavigate } from "react-router-dom";

const Graded = ({ studentId }) => {
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch student grades from Firestore
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const studentDocRef = doc(db, "sts", studentId);
        const studentDoc = await getDoc(studentDocRef);

        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          setGrades(studentData.grades || {});
        } else {
          setError("No grades found for this student.");
        }
      } catch (err) {
        console.error("Error fetching grades:", err);
        setError("Failed to fetch grades. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId]);

  return (
    <div className="view-grades-container">
      <div className="sidebar">
        <ul>
          <li>
            <button onClick={() => navigate("/studentdash")}>Dashboard</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <h2>View Grades</h2>

        {loading ? (
          <p>Loading grades...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="grades-list">
            <h3>Your Grades</h3>
            {Object.keys(grades).length > 0 ? (
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(grades).map(([courseId, grade]) => (
                    <tr key={courseId}>
                      <td>{courseId}</td>
                      <td>{grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No grades available yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Graded;
