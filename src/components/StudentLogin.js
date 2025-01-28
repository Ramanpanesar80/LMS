import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, app } from "../firebase"; // Import Firestore
import './StudentLogin.css';
import Navbar from "./Navbar";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/studentdash");
    }
  }, [auth, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch the student's document from Firestore
      const studentDocRef = doc(db, "students", userCredential.user.uid);
      const studentDoc = await getDoc(studentDocRef);

      if (studentDoc.exists()) {
        const studentData = studentDoc.data();

        // Check if the student is suspended
        if (studentData.suspended) {
          setError("Your account has been suspended. Please contact the administrator.");
          return;
        }

        // If not suspended, proceed with login
        setError("");
        alert("Login successful!");
        navigate("/studentdash", { state: { userEmail: userCredential.user.email } });
      } else {
        setError("No student data found. Please contact the administrator.");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("No user found with this email.");
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
      <div className="login-container">
        <div className="login-form">
          <h2 className="lo">Student Login</h2>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email:</label>
            <div className="input-group1">
              <input
                id="email1"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <label htmlFor="password1">Password:</label>
            <div className="input-group1">
              <input
                id="password1"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message2">{error}</p>}
            <div className="extra-links1">
              <a href="/forgot-password">Forgot password?</a>
            </div>
            <button type="submit" className="login-button1">Login</button>
          </form>
          <p className="register-link1">
            Don't have an account? <a href="/signup">Register here</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default StudentLogin;
