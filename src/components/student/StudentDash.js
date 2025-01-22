import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import Footer from "../Footer"; //  // Adjusted relative path
import "./StudentDash.css";
import Sidebar from "./Sidebar"; // Import Sidebar component

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch courses from Firestore
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

  const handleEnroll = async (course) => {
    if (enrolledCourses.some((enrolled) => enrolled.id === course.id)) {
      alert(`You are already enrolled in ${course.title}.`);
      return;
    }

    try {
      const enrolledCourse = {
        ...course,
        studentId: currentUser?.uid,
      };

      // Save enrolled course to Firestore under "students" collection
      if (currentUser) {
        await addDoc(
          collection(db, `students/${currentUser.uid}/enrolledCourses`),
          enrolledCourse
        );
        setEnrolledCourses((prev) => [...prev, enrolledCourse]);
        alert(`You have successfully enrolled in ${course.title}!`);
      } else {
        alert("Please sign in to enroll in courses.");
      }
    } catch (err) {
      console.error("Error enrolling in course:", err);
      alert("Failed to enroll in the course. Please try again.");
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
    <div className="sim">
      <header className="head">
        <h1>Student Dashboard</h1>
        <div className="button-con">
          <button className="btn">
            <Link to="/StudentProfile">Student Profile</Link>
          </button>
          <button className="button1 logout1" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

     <Sidebar/>

      <main className="con">
        <h2 className="h">List of Courses</h2>

        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <div className="error-message1">{error}</div>
        ) : (
          <div className="courses1">
            {courses.map((course, index) => (
              <div key={index} className="course-card1">
                <img src={course.image} alt={course.title} />
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p>
                  <strong>Created By:</strong> {course.createdBy || "Unknown"}
                </p>
                <button
                  className="button enroll1"
                  onClick={() => handleEnroll(course)}
                >
                  Enroll
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

     
      
      <Footer/>
    </div>
  );
};

export default StudentDashboard;
