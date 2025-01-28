import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import "./AdminLogin.css";
import Navbar from "./Navbar";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      navigate("/manage-users");
    }
  }, [auth, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const adminDocRef = doc(db, "admin", user.uid); 
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
      
        alert(`Login successful!\nEmail: ${user.email}\nRole: admin`);
        navigate("/manage-users");
      } else {
      
        setError("Access denied. You are not authorized as an admin.");
      }
    } catch (error) {
     
      if (error.code === "auth/user-not-found") {
        setError("No admin found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
    <Navbar />
    <div className="Admin">
      <div className="Admin-form">
        <h2 className="Adm">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group3">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group3">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message3">{error}</p>}
          <button type="submit" className="Admin-button">
            Login
          </button>
        </form>
      </div>
    </div>
  </>
);
};


export default AdminLogin;
