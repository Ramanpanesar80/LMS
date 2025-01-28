import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, updatePassword } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from "../firebase"; 
import "./ChangePassword.css";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const { userId } = location.state || {};

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    try {
      const user = auth.currentUser;

      // Update the password in Firebase Authentication
      await updatePassword(user, newPassword);

      // Update the passwordChangeRequired flag in Firestore
      const teacherDocRef = doc(db, "teacher", userId);
      await updateDoc(teacherDocRef, { passwordChangeRequired: false });

      setSuccess("Password changed successfully!");
      setTimeout(() => navigate("/create-course"), 2000);
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Failed to change the password. Please try again.");
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <div className="input-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" className="change-password-button">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
