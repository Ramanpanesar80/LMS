import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase"; // Firebase configuration
import Navbar from "./Navbar";

const TeacherLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      // Step 1: Authenticate the teacher
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Step 2: Check Firestore for teacher details
      const teacherDocRef = doc(db, "teacher", user.uid); // Match Firestore UID
      const teacherDoc = await getDoc(teacherDocRef);
  
      if (teacherDoc.exists()) {
        const teacherData = teacherDoc.data();
  
        if (teacherData.status === "suspended") {
          setError("Your account is suspended. Please contact the administrator.");
        } else if (teacherData.role === "teacher") {
          // Valid and active teacher
          alert("Login successful! Redirecting to Teacher Dashboard...");
          navigate("/create-course", { state: { userEmail: user.email, role: "teacher" } });
        } else {
          setError("Access denied. You are not authorized as a teacher.");
        }
      } else {
        setError("Access denied. You are not authorized as a teacher.");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("No teacher found with this email.");
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
          <h2>Teacher Login</h2>
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
