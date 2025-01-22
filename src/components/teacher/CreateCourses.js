import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import Footer from "../Footer"; //  // Adjusted relative path
// import "./StudentDash.css";
import Sidebar from "./Sidebar1"; //
// import "./CreateCourses.css";

const CreateCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherName, setTeacherName] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();

 
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

    if (title && description && imageFile) {
      setIsSubmitting(true);
      try {
        
        const imageURL = URL.createObjectURL(imageFile);

        
        await addDoc(collection(db, "courses"), {
          title,
          description,
          image: imageURL,
          createdBy: teacherName, 
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
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="create-course-container">
    
     <Sidebar/>

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
      <Footer/>
    </div>
  );
};

export default CreateCourse;
