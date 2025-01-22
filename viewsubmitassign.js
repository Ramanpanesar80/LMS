import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase"; // Firebase configuration
import { getStorage, getDownloadURL, ref } from "firebase/storage"; 
import { Timestamp } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom";
import "./Viewsubmitassignment.css";
// import Footer from "../Footer"; 
// import "./StudentDash.css";
import Sidebar from "./Sidebar1";

const TeacherViewAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();


  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "courses"),
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
        },
        (err) => {
          console.error("Error fetching assignments:", err);
          setError("Failed to load assignments. Please try again later.");
        }
      );

      return () => unsubscribe();
    }
  }, [selectedCourse]);

  
  const getFileDownloadUrl = async (filePath) => {
    try {
      const storage = getStorage();
      const fileRef = ref(storage, filePath);
      const fileUrl = await getDownloadURL(fileRef);
      return fileUrl;
    } catch (error) {
      console.error("Error fetching file URL:", error);
    }
  };

  return (
    <div className="view-teacher-assignments-container">
     <Sidebar/>

      <div className="main-content">
        <h2>Teacher - View Assignments</h2>

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
                  <p>Submitted by Student ID: {assignment.studentId}</p>
                  <p>
                    Submitted on:{" "}
                    {assignment.submittedAt instanceof Timestamp
                      ? assignment.submittedAt.toDate().toString()
                      : "Not available"}
                  </p>
                  <a
                  
                    href={getFileDownloadUrl(assignment.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Assignment File
                  </a>
                </div>
              ))
            ) : (
              <p>No assignments found for this course.</p>
            )}
          </div>
        )}
      </div>
      {/* <Footer/> */}
    </div>
  );
};

export default TeacherViewAssignments;
