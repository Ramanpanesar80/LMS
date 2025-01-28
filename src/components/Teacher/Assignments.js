import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db, storage } from "../../firebase";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import Footer from "../Footer";
import Sidebar from "./Sidebar1";

const Assignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [themeDescription, setThemeDescription] = useState(""); // Changed from documentFile to themeDescription
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch courses created by the logged-in teacher
  useEffect(() => {
    if (currentUser) {
      const fetchCourses = async () => {
        const coursesQuery = query(
          collection(db, "courses"),
          where("createdByUid", "==", currentUser.uid) // Filter by the logged-in teacher's UID
        );
        const unsubscribe = onSnapshot(
          coursesQuery,
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
      };

      fetchCourses();
    }
  }, [currentUser]);

  // Fetch assignments for the selected course
  useEffect(() => {
    if (selectedCourse) {
      const unsubscribe = onSnapshot(
        collection(db, `courses/${selectedCourse.id}/assignments`),
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

  // Handle adding a new assignment
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !assignmentTitle || !dueDate || !themeDescription) {
      alert("Please fill out all fields, including a theme description.");
      return;
    }

    try {
      // Add the assignment to Firestore
      await addDoc(collection(db, `courses/${selectedCourse.id}/assignments`), {
        title: assignmentTitle,
        themeDescription, // Store the theme description instead of document URL
        dueDate,
        createdAt: new Date(),
      });

      // Clear the form
      setAssignmentTitle("");
      setThemeDescription(""); // Reset themeDescription field
      setDueDate("");
      alert("Assignment added successfully.");
    } catch (err) {
      console.error("Error adding assignment:", err);
      alert("Failed to add assignment. Please try again.");
    }
  };

  // Handle deleting an assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteDoc(
          doc(db, `courses/${selectedCourse.id}/assignments`, assignmentId)
        );
        alert("Assignment deleted successfully.");
      } catch (err) {
        console.error("Error deleting assignment:", err);
        alert("Failed to delete assignment. Please try again.");
      }
    }
  };

  return (
    <div className="assignments-container">
      <Sidebar />

      <div className="main-content">
        <h2>Assignments</h2>

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
          <>
            <div className="assignments-form">
              <h3>Add Assignment to: {selectedCourse.title}</h3>
              <form onSubmit={handleAddAssignment}>
                <label>
                  Assignment Title:
                  <input
                    type="text"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="Enter assignment title"
                    required
                  />
                </label>
                <label>
                  Due Date:
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]} // Sets the minimum date to today
                  />
                </label>
                <label>
                  Theme Description:
                  <textarea
                    value={themeDescription}
                    onChange={(e) => setThemeDescription(e.target.value)}
                    placeholder="Enter theme description"
                    required
                  />
                </label>
                <button type="submit">Add Assignment</button>
              </form>
            </div>

            <div className="assignments-list">
              <h3>Assignments for {selectedCourse.title}</h3>
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-card">
                    <p>{assignment.title}</p>
                    <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    <p>{assignment.themeDescription}</p> {/* Display the theme description */}
                    <button
                      className="button delete-assignment"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p>No assignments found for this course.</p>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Assignments;
