import { getAuth, signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, Timestamp, where, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; 
import "./Viewsubmitassignment.css";
import { Link, useNavigate } from "react-router-dom";

const TeacherViewAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const auth = getAuth();
  const currentUser = auth.currentUser;

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

  // Sign out handler
  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate("/login"); // Redirect to login page after signing out
    }).catch((error) => {
      console.error("Sign out error:", error);
    });
  };

  return (
    <div className="view-teacher-assignments-container">
      <header className="list-header">
        <h1 className="preet">Teacher Dashboard</h1>
        <div className="button-list">
          <button className="btn-list">
            <Link to="/ViewProfile">Teacher Profile</Link>
          </button>
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>
      <div className="sidebar-view">
        <ul>
          <li><Link to="/create-course">Create Courses</Link></li>
          <li><Link to="/assignments">Post Assignment</Link></li>
          <li><Link to="/viewsubmitassignments">View Submitted Assignments</Link></li>
          <li><Link to="/postquestion">Discussion</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/view-course">View Course</Link></li>
          <li><Link to="/upload-syllabus">Upload Syllabus</Link></li>
          <li><Link to="/upload-schedule">Upload Schedule</Link></li>
          <li><Link to="/upload-documents">Course Documents</Link></li>
        </ul>
      </div>

      <div className="main-content-view">
        <h2 className="viewh">Teacher - View Submitted Assignments</h2>

        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <div className="error-message-view">{error}</div>
        ) : (
          <div className="courses-list-view">
            <h3 className="viewh1">Select a Course</h3>
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
          <div className="assignments-list-view">
            <h3 className="view-m">Submitted Assignments for {selectedCourse.title}</h3>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card-view">
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
              <p className="view-pl">No assignments found for this course.</p>
            )}
          </div>
        )}
      </div>

      <footer className="footer-view">
        <a href="#" className="footer-link-view">About Us</a>
        <a href="#" className="footer-link-view">Privacy Policy</a>
        <a href="#" className="footer-link-view">Terms and Conditions</a>
        <a href="#" className="footer-link-view">Contact Us</a>
      </footer>
    </div>
  );
};

export default TeacherViewAssignments;
