import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase"; 
import './StudentLogin.css';

import Navbar from "./Navbar";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; 
      setError("");
      alert("Login successful!");
      navigate("/listofcourses", { state: { userEmail: user.email } });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError(" ");
      } else {
        setError("Invalid Username or Password.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-form">
          <h2>Student Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
            </div>
            {error && <p className="error">{error}</p>}
            <p1>
              <a href="/forgot-password">Forgot password?</a>
            </p1>
            <button type="submit">Login</button>
          </form>
          <p>
            Don't have an account? <a href="/signup">Register here</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default StudentLogin;
