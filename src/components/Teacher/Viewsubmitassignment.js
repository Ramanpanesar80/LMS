import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, Timestamp, where, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Firebase configuration
import Sidebar from "./Sidebar1";
import "./Viewsubmitassignment.css";

const TeacherViewAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch courses created by the logged-in teacher
  useEffect(() => {
    if (currentUser) {
      const coursesQuery = query(
        collection(db, "courses"),
        where("createdByUid", "==", currentUser.uid)
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
    }
  }, [currentUser]);

  // Fetch assignments for the selected course
  useEffect(() => {
    if (!selectedCourse) {
      setAssignments([]);
      return;
    }

    const fetchAssignmentsForCourse = async () => {
      try {
        const assignmentsQuery = query(
          collection(db, `uploads/${selectedCourse.id}/assignments`)
        );

        const unsubscribe = onSnapshot(
          assignmentsQuery,
          async (snapshot) => {
            const assignmentsData = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const assignment = { id: doc.id, ...doc.data() };

                // Fetch student name using the studentId field
                const studentId = assignment.studentId;
                if (studentId) {
                  try {
                    const studentDoc = await getDoc(doc(db, "students", studentId));
                    assignment.studentName = studentDoc.exists()
                      ? studentDoc.data().name
                      : "Unknown Student";
                  } catch (error) {
                    console.error(
                      `Error fetching student name for ID ${studentId}:`,
                      error
                    );
                  }
                } else {
                  assignment.studentName = "Unknown Student";
                }

                return assignment;
              })
            );

            setAssignments(assignmentsData);
          },
          (err) => {
            console.error("Error fetching assignments:", err);
            setError("Failed to load assignments. Please try again later.");
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Failed to load assignments. Please try again later.");
      }
    };

    fetchAssignmentsForCourse();
  }, [selectedCourse]);

  // Handle grade input change
  const handleGradeChange = (assignmentId, grade) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [assignmentId]: grade,
    }));
  };

  // Handle feedback input change
  const handleFeedbackChange = (assignmentId, feedback) => {
    setFeedbacks((prevFeedbacks) => ({
      ...prevFeedbacks,
      [assignmentId]: feedback,
    }));
  };

  // Submit grade and feedback
  const handleSubmitGradeAndFeedback = async (studentId, assignmentId) => {
    try {
      const grade = grades[assignmentId];
      const feedback = feedbacks[assignmentId];
      if (!grade || !feedback) {
        alert("Please enter both a grade and feedback before submitting.");
        return;
      }

      const gradeDocRef = doc(
        db,
        `students/${studentId}/enrolledCourses/${selectedCourse.id}/grades`,
        assignmentId
      );
      await setDoc(gradeDocRef, { grade, feedback });

      alert("Grade and feedback submitted successfully!");
      setEditMode((prevEditMode) => ({ ...prevEditMode, [assignmentId]: false }));
    } catch (err) {
      console.error("Error submitting grade and feedback:", err);
      setError("Failed to submit grade and feedback. Please try again.");
    }
  };

  // Enable grade and feedback update mode
  const enableGradeEdit = (assignmentId) => {
    setEditMode((prevEditMode) => ({ ...prevEditMode, [assignmentId]: true }));
  };

  return (
    <div className="view-teacher-assignments-container">
      <Sidebar />

      <div className="main-content">
        <h2>Teacher - View Submitted Assignments</h2>

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
                className={`course-card ${
                  selectedCourse?.id === course.id ? "selected" : ""
                }`}
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
            <h3>Submitted Assignments for {selectedCourse.title}</h3>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <p><strong>Title:</strong> {assignment.title}</p>
                  <p><strong>Description:</strong> {assignment.description}</p>
                  <p><strong>Submitted by:</strong> {assignment.studentName}</p>
                  <p>
                    <strong>Submitted on:</strong>{" "}
                    {assignment.submittedAt instanceof Timestamp
                      ? assignment.submittedAt.toDate().toLocaleString()
                      : "Not available"}
                  </p>
                  {assignment.fileURL ? (
                    <a
                      href={assignment.fileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Assignment
                    </a>
                  ) : (
                    <p>No file uploaded</p>
                  )}
                  {editMode[assignment.id] ? (
                    <>
                      <input
                        type="text"
                        placeholder="Enter grade"
                        value={grades[assignment.id] || ""}
                        onChange={(e) => handleGradeChange(assignment.id, e.target.value)}
                      />
                      <textarea
                        placeholder="Enter feedback"
                        value={feedbacks[assignment.id] || ""}
                        onChange={(e) => handleFeedbackChange(assignment.id, e.target.value)}
                      />
                      <button
                        onClick={() =>
                          handleSubmitGradeAndFeedback(
                            assignment.studentId,
                            assignment.id
                          )
                        }
                      >
                        Submit
                      </button>
                    </>
                  ) : (
                    <>
                      <p><strong>Grade:</strong> {grades[assignment.id] || "Not graded yet"}</p>
                      <p><strong>Feedback:</strong> {feedbacks[assignment.id] || "No feedback yet"}</p>
                      <button onClick={() => enableGradeEdit(assignment.id)}>
                        Update Grade and Feedback
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>No assignments found for this course.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherViewAssignments;
