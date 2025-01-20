import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "./ViewCourses.css";

const ViewCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Listen for real-time updates to the courses collection
    const unsubscribe = onSnapshot(
      collection(db, "courses"),
      (snapshot) => {
        const coursesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
        setLoading(false); // Stop loading once data is fetched
      },
      (err) => {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleRemoveCourse = async (courseId) => {
    if (!courseId) {
      alert("Invalid course ID.");
      return;
    }
    if (window.confirm("Are you sure you want to remove this course?")) {
      try {
        await deleteDoc(doc(db, "courses", courseId));
        alert("Course removed successfully.");
      } catch (err) {
        console.error("Error removing course:", err);
        alert("Failed to remove course. Please try again.");
      }
    }
  };

  const handleFinishCourse = async (courseId) => {
    if (!courseId) {
      alert("Invalid course ID.");
      return;
    }
    try {
      await updateDoc(doc(db, "courses", courseId), { status: "finished" });
      alert("Course marked as finished.");
    } catch (err) {
      console.error("Error finishing course:", err);
      alert("Failed to mark course as finished. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="view-course-container">
      <div className="sidebar1">
        <ul>
          <li>
            <Link to="/create-course">Create Courses</Link>
          </li>
          <li>
            <Link to="/assignments">Post Assignment</Link>
          </li>
          <li>
            <Link to="/post-grade">Post Grade</Link>
          </li>
          <li>
            <Link to="/submitted-assignments">View Submitted Assignments</Link>
          </li>
          <li>
            <Link to="/discussion">Discussion</Link>
          </li>
          <li>
            <Link to="/report">Report</Link>
          </li>
          <li>
            <Link to="/post-course-docs">Post Course Docs</Link>
          </li>
          <li>
            <Link to="/attendance">Attendance</Link>
          </li>
          <li>
            <Link to="/view-course">View Course</Link>
          </li>
          
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <h1>Educator Dashboard</h1>
          </div>
          <div className="header-right">
            <button className="header-button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>

        <h2>List of Courses</h2>
        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : courses.length === 0 ? (
          <div className="no-courses">
            <h3>No Courses Available</h3>
            <p>Currently, there are no courses available to display. Please check back later!</p>
          </div>
        ) : (
          <div className="courses-list">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <img src={course.image} alt={course.title} className="course-image" />
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p>
                  <strong>Created By:</strong> {course.createdBy || "Unknown"}
                </p>
                <p>
                  <strong>Status:</strong> {course.status || "ongoing"}
                </p>

                <div className="course-actions">
                  <button
                    className="button remove-course"
                    onClick={() => handleRemoveCourse(course.id)}
                  >
                    Remove Course
                  </button>

                  <button
                    className="button finish-course"
                    onClick={() => handleFinishCourse(course.id)}
                  >
                    Finish Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer1">
        <a href="#" className="footer-link">
          About Us
        </a>
        <a href="#" className="footer-link">
          Privacy Policy
        </a>
        <a href="#" className="footer-link">
          Terms and Conditions
        </a>
        <a href="#" className="footer-link">
          Contact Us
        </a>
      </footer>
    </div>
  );
};

export default ViewCourses;
