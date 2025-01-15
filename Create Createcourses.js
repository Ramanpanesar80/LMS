import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./CreateCourses.css";

const CreateCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (title && description && imageFile) {
      setIsSubmitting(true);
      try {
       
        const imageURL = URL.createObjectURL(imageFile);

       
        await addDoc(collection(db, "courses"), {
          title,
          description,
          image: imageURL,
          createdAt: new Date(),
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/Homepage");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="create-course-container">
      <div className="sidebar1">
        <ul>
          <li><Link to="/create-course">Create Courses</Link></li>
          <li><Link to="/post-assignment">Post Assignment</Link></li>
          <li><Link to="/post-grade">Post Grade</Link></li>
          <li><Link to="/submitted-assignments">View Submitted Assignments</Link></li>
          <li><Link to="/discussion">Discussion</Link></li>
          <li><Link to="/report">Report</Link></li>
          <li><Link to="/post-course-docs">Post Course Docs</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/view-course">View Course</Link></li>
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

        <h2>Create a New Course</h2>
        <form onSubmit={handleCreateCourse} className="create-course-form">
          <label>
            Course Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
          <label>
            Choose Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </label>
          {imageFile && (
            <div className="image-preview">
              <p>Image Preview:</p>
              <img src={URL.createObjectURL(imageFile)} alt="Course Preview" />
            </div>
          )}
          <button
            type="submit"
            className="button create"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
      <footer className="footer1">
        <a href="#" className="footer-link">About Us</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Contact Us</a>
      </footer>
    </div>
  );
};

export default CreateCourse;
