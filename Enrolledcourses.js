import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import Footer from "../Footer";
import Sidebar from "./Sidebar";
import { Link, useNavigate } from "react-router-dom"; // Add this line
import { getAuth, signOut } from "firebase/auth";
import "./EnrolledCourses.css";

const EnrolledCourses = () => {
  const auth = getAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (currentUser) {
        try {
          const enrolledSnapshot = await getDocs(
            collection(db, `students/${currentUser.uid}/enrolledCourses`)
          );
          const enrolledData = enrolledSnapshot.docs.map((doc) => ({
            firestoreId: doc.id,
            ...doc.data(),
          }));
          setEnrolledCourses(enrolledData);
        } catch (err) {
          console.error("Error fetching enrolled courses:", err);
        }
      }
    };

    fetchEnrolledCourses();
  }, [currentUser]);

  const handleWithdraw = async (courseFirestoreId) => {
    if (currentUser) {
      try {
        const courseDocRef = doc(
          db,
          `students/${currentUser.uid}/enrolledCourses`,
          courseFirestoreId
        );
        await deleteDoc(courseDocRef);

        const courseRef = doc(db, `courses/${courseFirestoreId}`);
        const studentRef = doc(
          collection(courseRef, "enrolledStudents"),
          currentUser.uid
        );
        await deleteDoc(studentRef);

        setEnrolledCourses((prev) =>
          prev.filter((course) => course.firestoreId !== courseFirestoreId)
        );
        alert("You have successfully withdrawn from the course.");
      } catch (err) {
        console.error("Error withdrawing from course:", err);
        alert("Failed to withdraw. Please try again.");
      }
    } else {
      alert("No user logged in.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="Enrolled">
      <header className="list-header">
        <h1 className="preet">Student Dashboard</h1>
        <div className="button-list">
          <button className="btn-list">
            <Link to="/ViewProfile">Student Profile</Link>
          </button>
        
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <nav className="sidebar-enrolled">
              <ul>
              <li><Link to="/studentdash">List of courses</Link></li>
                <li>
                  <Link to="/enrolled-courses" state={{ enrolledCourses }}>
                    Enrolled Courses
                  </Link>
                </li>
                <li><Link to="/syllabus">Syllabus</Link></li>
                <li><Link to="/schedule">Course Schedule</Link></li>
                <li><Link to="/discussions">Discussions</Link></li>
                <li><Link to="/assignmentsandquizzes">Assignments & Quiz</Link></li>
                <li><Link to="/graded">Grades</Link></li>
                <li><Link to="/course-documents">Course Documents</Link></li>
                <li><Link to="/report">Report</Link></li>
                <li><Link to="/attendance">Attendance</Link></li>
                <li><Link to="/notifications">Notifications</Link></li>
                <li><Link to="/studentnotificationsetup">Student Notification Setup</Link></li>
                <li> <Link to="/duedate">Duedate</Link>
              </li>
              </ul>
            </nav>

      <main className="enrolled-content">
        <h2 className="enroll">Enrolled Courses</h2>
        <div className="enrolled-courses">
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => (
              <div key={course.firestoreId} className="course-card-erolled">
                <h3>{course.title}</h3>
                <p>
                  <strong>Teacher:</strong> {course.createdBy || "Unknown"}
                </p>
                <p>{course.description}</p>
                <button
                  className="button withdraw2"
                  onClick={() => handleWithdraw(course.firestoreId)}
                >
                  Withdraw
                </button>
              </div>
            ))
          ) : (
            <p>No courses enrolled yet.</p>
          )}
        </div>
      </main>
      <footer className="footer-c">
      <a href="#" className="footer-link-c">About Us</a>
      <a href="#" className="footer-link-c">Privacy Policy</a>
      <a href="#" className="footer-link-c">Terms and Conditions</a>
      <a href="#" className="footer-link-c">Contact Us</a>
    </footer>
      
    </div>
  );
};

export default EnrolledCourses;
