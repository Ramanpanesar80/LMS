import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, addDoc } from "firebase/firestore"; // Added addDoc import
import { db } from "../../firebase"; // Import your Firebase Firestore setup
import { Timestamp } from "firebase/firestore"; // Import Timestamp to handle Firestore dates
import "./assignmentandquizzes.css";

import Footer from "../Footer";

const Assignmentsandquizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Fetch courses for the student
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "courses"), // Fetching courses collection
      (snapshot) => {
        const coursesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch assignments for the selected course
  useEffect(() => {
    if (selectedCourse) {
      const unsubscribe = onSnapshot(
        collection(db, `uploads/${selectedCourse.id}/assignments`),
        (snapshot) => {
          const assignmentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAssignments(assignmentsData);
          console.log("Assignments fetched:", assignmentsData); // Debugging line
        },
        (err) => {
          console.error("Error fetching assignments:", err);
          setError("Failed to load assignments. Please try again later.");
        }
      );

      return () => unsubscribe();
    }
  }, [selectedCourse]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Submit the student's assignment
  const handleSubmitAssignment = async () => {
    console.log("Submit button clicked"); // Debugging line
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    try {
      // Placeholder for the actual student ID
      const studentId = "studentId"; // You need to replace this with the actual student ID

      await addDoc(collection(db, `uploads/${selectedCourse.id}/assignments`), {
        title: file.name,
        submittedAt: new Date(), // Storing current time as 'submittedAt'
        studentId: studentId, // Replace with actual student's ID
      });

      setMessage("Assignment submitted successfully!");
      setFile(null); // Reset file input
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setMessage("Failed to submit the assignment. Please try again.");
    }
  };

  return (
    <div className="view-assignments-container">
      <div className="sidebar">
        <ul>
          <li>
            <button onClick={() => navigate("/studentdash")}>Dashboard</button>
          </li>
          <li>
            <button onClick={() => navigate("/enrolled-courses")}>Enrolled Courses</button>
          </li>
          <li>
            <button onClick={() => navigate("/view-assignments")}>View Assignments</button>
          </li>
        </ul>
      </div>
    

      <div className="main-content">
        <h2>View Assignments</h2>

        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="courses-list">
            <h3>Select a Course</h3>
            {courses.map((course) => (
              <div
                key={course.id}
                className={`course-card ${selectedCourse?.id === course.id ? "selected" : ""}`}
                onClick={() => setSelectedCourse(course)}
              >
                <h4>{course.title}</h4>
                <p>{course.description}</p>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="assignments-list">
            <h3>Assignments for {selectedCourse.title}</h3>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <p>Title: {assignment.title}</p>
                  <p>
                    Submitted on:{" "}
                    {assignment.submittedAt instanceof Timestamp
                      ? assignment.submittedAt.toDate().toString()
                      : "Not available"}
                  </p>
                </div>
              ))
            ) : (
              <p>No assignments found for this course.</p>
            )}

            <div className="submit-assignment">
              <h3>Submit Your Assignment</h3>
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleSubmitAssignment}>Submit Assignment</button>
              {message && <p>{message}</p>}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Assignmentsandquizzes;
