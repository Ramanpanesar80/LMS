import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, addDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import Sidebar from "./Sidebar1"; 
import "./CreateCourses.css";

const CreateCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherName, setTeacherName] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();

  // Fetch teacher's name from Firestore
  useEffect(() => {
    const fetchTeacherName = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const teacherDocRef = doc(db, "teacher", user.uid);
          const teacherDoc = await getDoc(teacherDocRef);

          if (teacherDoc.exists()) {
            const data = teacherDoc.data();
            setTeacherName(data.name || "Unknown Teacher");
          } else {
            console.error("Teacher document not found.");
          }
        }
      } catch (error) {
        console.error("Error fetching teacher name:", error);
      }
    };

    fetchTeacherName();
  }, [auth]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (title.trim() && description.trim()) {
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "courses"), {
          title: title.trim(),
          description: description.trim(),
          createdBy: teacherName, // Use the fetched teacher name
          createdByUid: auth.currentUser.uid, // Use the current user's UID
          createdAt: serverTimestamp(), // Use server timestamp
        });

        alert("The course has been successfully added!");
        navigate("/view-course");
      } catch (error) {
        console.error("Error creating course:", error);
        alert("There was an error creating the course. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert("Please fill out all fields to create a course.");
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
    <div className="create">
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

      <Sidebar />

      <form onSubmit={handleCreateCourse} className="do">
        <h2 className="c">Create a New Course</h2>
        <label>Course Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the course title"
          required
        />

        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a brief description of the course"
          required
        />

        <button
          type="submit"
          className="buttonthis"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Course"}
        </button>
      </form>
      <footer className="footer-create">
        <a href="#" className="footer-link">About Us</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Contact Us</a>
      </footer>
    </div>
  );
};

export default CreateCourse;
