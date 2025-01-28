import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase"; 
import "./TeacherLogin.css";
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
      // Sign in the teacher
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the teacher's document from Firestore
      const teacherDocRef = doc(db, "teacher", user.uid);
      const teacherDoc = await getDoc(teacherDocRef);

      if (teacherDoc.exists()) {
        const teacherData = teacherDoc.data();

        // Check if the password change is required
        if (teacherData.passwordChangeRequired) {
          navigate("/change-password", { state: { userId: user.uid, email: user.email } });
        } else {
          alert("Login successful! Redirecting to Teacher Dashboard...");
          navigate("/create-course", {
            state: { userEmail: user.email, role: "teacher" },
          });
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
      <div className="logint">
        <div className="login-form2">
          <h2 className="tm">Teacher Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group2">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error2">{error}</p>}
            <button type="submit" className="t-login">Login</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default TeacherLogin;
