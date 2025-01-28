import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import t1Image from "./images/t1.jpg";
import Navbar from "./Navbar";
import './Home.css';

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Retrieve user role from sessionStorage
        const role = sessionStorage.getItem("role");
        if (role === "student") {
          navigate("/studentdash");
        } else if (role === "teacher") {
          navigate("/create-course");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="Homepage">
        <header>
          <h1>Learning Management System</h1>
          <p>
            Platform for creating, managing, delivering, and tracking educational
            content and learning.
          </p>
        </header>
        
        <div className="image1">
          <img src={t1Image} alt="Educational Content" />
        </div>
        
        <main className="mn">
  <div className="portals1">
    <Link to="/student" className="portal">
      Student Portal
    </Link>
    <Link to="/educator" className="portal">
      Educator Portal
    </Link>
    <Link to="/admin" className="portal">
      Admin Portal
    </Link>
  </div>
</main>
      </div>
    </>
  );
};

export default Homepage;
