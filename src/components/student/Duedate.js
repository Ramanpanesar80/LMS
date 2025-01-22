import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db, storage } from "../../firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Assignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();

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

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !assignmentTitle || !dueDate) {
      alert("Please select a course, enter an assignment title, and choose a due date.");
      return;
    }

    try {
      let documentURL = null;
      if (documentFile) {
        const storageRef = ref(storage, `course-documents/${selectedCourse.id}/${documentFile.name}`);
        await uploadBytes(storageRef, documentFile);
        documentURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, `courses/${selectedCourse.id}/assignments`), {
        title: assignmentTitle,
        documentURL,
        dueDate: new Date(dueDate),
        createdAt: new Date(),
      });
      setAssignmentTitle("");
      setDocumentFile(null);
      setDueDate("");
      alert("Assignment added successfully.");
    } catch (err) {
      console.error("Error adding assignment:", err);
      alert("Failed to add assignment. Please try again.");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteDoc(doc(db, `courses/${selectedCourse.id}/assignments`, assignmentId));
        alert("Assignment deleted successfully.");
      } catch (err) {
        console.error("Error deleting assignment:", err);
        alert("Failed to delete assignment. Please try again.");
      }
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setNewDueDate(assignment.dueDate.toDate().toISOString().split("T")[0]); // Pre-fill with current due date
  };

  const handleSaveEdit = async () => {
    if (!newDueDate) {
      alert("Please select a valid due date.");
      return;
    }

    try {
      const assignmentDoc = doc(db, `courses/${selectedCourse.id}/assignments`, editingAssignment.id);
      await updateDoc(assignmentDoc, { dueDate: new Date(newDueDate) });
      alert("Due date updated successfully.");
      setEditingAssignment(null);
      setNewDueDate("");
    } catch (err) {
      console.error("Error updating assignment:", err);
      alert("Failed to update due date. Please try again.");
    }
  };

  return (
    <div className="assignments-container">
      <div className="sidebar1">
        <ul>
          <li>
            <button onClick={() => navigate("/view-course")}>View Courses</button>
          </li>
          <li>
            <button onClick={() => navigate("/create-course")}>Create Course</button>
          </li>
          <li>
            <button onClick={() => navigate("/assignments")}>Assignments</button>
          </li>
        </ul>
      </div>

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
                  Upload Document (Optional):
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setDocumentFile(e.target.files[0])}
                  />
                </label>
                <label>
                  Due Date:
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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
                    {assignment.documentURL && (
                      <a href={assignment.documentURL} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    )}
                    <p>Due Date: {new Date(assignment.dueDate.toDate()).toLocaleDateString()}</p>
                    <button
                      className="button edit-assignment"
                      onClick={() => handleEditAssignment(assignment)}
                    >
                      Edit Due Date
                    </button>
                    <button
                      className="button delete-assignment"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      Delete
                    </button>

                    {editingAssignment?.id === assignment.id && (
                      <div className="edit-form">
                        <label>
                          New Due Date:
                          <input
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                          />
                        </label>
                        <button onClick={handleSaveEdit}>Save</button>
                        <button onClick={() => setEditingAssignment(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No assignments found for this course.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Assignments;
