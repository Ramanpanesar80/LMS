import React, { useState } from "react";
import "./ForgotPassword.css";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { app } from "./firebase"; 
import Navbar from "./components/Navbar"; 

const Forgotpassword = () => {
  const [email, setEmail] = useState("");
  const auth = getAuth(app);

  const handleReset = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert(`Password reset email sent to ${email}`);
        setEmail("");
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    } else {
      alert("Please enter your email address.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="reset-container">
        <div className="reset-form">
          <h2>Reset Password</h2>
          <form onSubmit={handleReset}>
            <div className="input-group">
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="reset-input"
              />
            </div>
            <button type="submit" className="reset-button">
              Send Reset Email
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Forgotpassword;
