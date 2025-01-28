import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./ViewCourses.css";

const ViewCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const [teacherId, setTeacherId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherId = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setTeacherId(user.uid);
        } else {
          console.error("No authenticated user found.");
        }
      } catch (error) {
        console.error("Error fetching teacher ID:", error);
      }
    };

    fetchTeacherId();
  }, [auth]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!teacherId) return;

      try {
        const q = query(collection(db, "courses"), where("createdByUid", "==", teacherId));
        const querySnapshot = await getDocs(q);

        const coursesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [teacherId]);

  const handleDeleteCourse = async (courseId) => {
    try {
      // Fetch and delete all enrolled students for the course
      const studentsCollection = collection(db, `courses/${courseId}/enrolledStudents`);
      const studentsSnapshot = await getDocs(studentsCollection);
  
      for (const studentDoc of studentsSnapshot.docs) {
        await deleteDoc(doc(db, `courses/${courseId}/enrolledStudents`, studentDoc.id));
      }
  
      // Delete the course document
      const courseRef = doc(db, "courses", courseId);
      await deleteDoc(courseRef);
  
      // Update state to remove the course from the list
      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
  
      alert("Course and all related data deleted successfully.");
    } catch (error) {
      console.error("Error deleting course and enrolled students:", error);
    }
  };
  
  const handleFinishCourse = async (courseId) => {
    try {
      // Update the course status to "finished"
      const courseRef = doc(db, "courses", courseId);
      await setDoc(
        courseRef,
        {
          status: "finished",
          finishedAt: serverTimestamp(), // Optional: Add a timestamp for when the course was finished
        },
        { merge: true } // Ensure only the status field is updated
      );
  
      // Update state to mark the course as finished
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, status: "finished" } : course
        )
      );
  
      alert("Course marked as finished successfully.");
    } catch (error) {
      console.error("Error finishing the course:", error);
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
    <div className="view">
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
      <div className="sidebar1">
        <ul>
          <li><Link to="/create-course">Create Courses</Link></li>
          <li><Link to="/assignments">Post Assignment</Link></li>
          <li><Link to="/grades">Post Grade</Link></li>
          <li><Link to="/viewsubmitassignments">View Submitted Assignments</Link></li>
          <li><Link to="/postquestion">Discussion</Link></li>
          <li><Link to="/report">Report</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/view-course">View Course</Link></li>
          <li><Link to="/upload-syllabus">Syllabus</Link></li>
          <li><Link to="/upload-schedule">Schedule</Link></li>
          <li><Link to="/upload-documents">Course Documents</Link></li>
        </ul>
      </div>

      <main className="view-rr">
        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <div className="view-ddd">
            <h2 className="view-y">View Courses</h2>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="view-fff">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <button
                    className="b67"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Delete Course
                  </button>
                  <button
                    className="b67"
                    onClick={() => handleFinishCourse(course.id)}
                  >
                    Finish Course
                  </button>
                </div>
              ))
            ) : (
              <p>No courses created yet.</p>
            )}
          </div>
        )}
      </main>
      <footer className="footer-view">
        <a href="#" className="footer-link">About Us</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Contact Us</a>
      </footer>
    </div>
  );
};

export default ViewCourses;
