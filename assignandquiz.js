import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Timestamp } from "firebase/firestore";
import "./assignmentandquizzes.css";

const Assignmentsandquizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]); 
  const [studentAssignments, setStudentAssignments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

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
      const teacherAssignmentsRef = collection(db, `courses/${selectedCourse.id}/assignments`);
      const studentAssignmentsRef = collection(db, `uploads/${selectedCourse.id}/assignments`);

      const unsubscribeTeacher = onSnapshot(
        teacherAssignmentsRef,
        (snapshot) => {
          const assignmentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTeacherAssignments(assignmentsData);
        },
        (err) => {
          console.error("Error fetching teacher assignments:", err);
          setError("Failed to load assignments. Please try again later.");
        }
      );

      const unsubscribeStudent = onSnapshot(
        studentAssignmentsRef,
        (snapshot) => {
          const assignmentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStudentAssignments(assignmentsData);
        },
        (err) => {
          console.error("Error fetching student assignments:", err);
          setError("Failed to load assignments. Please try again later.");
        }
      );

      return () => {
        unsubscribeTeacher();
        unsubscribeStudent();
      };
    }
  }, [selectedCourse]);

  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  
  const handleSubmitAssignment = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    try {
      const studentId = "studentId"; 

      await addDoc(collection(db, `uploads/${selectedCourse.id}/assignments`), {
        title: file.name,
        submittedAt: new Date(),
        studentId,
      });

      setMessage("Assignment submitted successfully!");
      setFile(null);
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
            <button onClick={() => navigate("/assignmentsandquizzes")}>View Assignments</button>
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
            <h3>Teacher's Assignments for {selectedCourse.title}</h3>
            {teacherAssignments.length > 0 ? (
              teacherAssignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <p>Title: {assignment.title}</p>
                  <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p>No assignments posted by the teacher yet.</p>
            )}

            <h3>Your Submissions</h3>
            {studentAssignments.length > 0 ? (
              studentAssignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <p>Title: {assignment.title}</p>
                  <p>
                    Submitted on:{" "}
                    {assignment.submittedAt instanceof Timestamp
                      ? assignment.submittedAt.toDate().toLocaleString()
                      : "Not available"}
                  </p>
                </div>
              ))
            ) : (
              <p>You haven't submitted any assignments for this course yet.</p>
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
    </div>
  );
};

export default Assignmentsandquizzes;
