import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore"; 
import Footer from "../Footer";
import Sidebar from "./Sidebar";
import"./StudentDash.css";

const StudentDash = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseSnapshot = await getDocs(collection(db, "courses"));
        const courseData = await Promise.all(
          courseSnapshot.docs.map(async (courseDoc) => {
            const course = { id: courseDoc.id, ...courseDoc.data() };
            if (course.createdBy) {
              const teacherDocRef = doc(db, "teacher", course.createdBy);
              const teacherDoc = await getDoc(teacherDocRef);
              course.teacher = teacherDoc.exists()
                ? teacherDoc.data().teacher
                : "Unknown";
            } else {
              course.teacher = "Unknown";
            }
            return course;
          })
        );
        setCourses(courseData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="list">
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

      <Sidebar />

      <main className="list-content">
        <h2 className="listh">Available Courses</h2>
        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="list-courses">
            {courses.map((course) => (
              <div key={course.id} className="course-card-list">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p>
                  <strong>Teacher:</strong> {course.createdBy}
                </p>
                <button
                  className="button enroll-1"
                  onClick={() => handleEnroll(course)}
                >
                  Enroll
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StudentDash;
