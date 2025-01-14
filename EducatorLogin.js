import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherLogin.css";
import Navbar from "./Navbar";

const TeacherLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Pre-defined credentials
  const predefinedCredentials = {
    email: "teacher@example.com",
    password: "password",
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if the entered credentials match the pre-defined ones
    if (email === predefinedCredentials.email && password === predefinedCredentials.password) {
      setError("");
      alert("Login successful!");
      navigate("/create-course", { state: { userEmail: email } });
    } else {
      if (email !== predefinedCredentials.email) {
        setError("No user found with this email.");
      } else if (password !== predefinedCredentials.password) {
        setError("Incorrect password.");
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
          <h2>Educator Login</h2>
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
            <div className="forgot-password">
              <a href="/forgot-password">Forgot password?</a>
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default TeacherLogin;
