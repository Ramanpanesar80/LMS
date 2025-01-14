import React, { useState, useEffect } from "react";
import "./StudentProfile.css";
import { doc, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const profileId = "12345"; 

  
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "profiles", profileId),
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data());
        } else {
          console.error("Profile not found!");
        }
      },
      (error) => {
        console.error("Error fetching profile:", error);
      }
    );

    return () => unsubscribe(); 
  }, [profileId]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      try {
        await deleteDoc(doc(db, "profiles", profileId));
        alert("Profile deleted successfully.");
        setProfile(null);
      } catch (error) {
        console.error("Error deleting profile:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "profiles", profileId), profile);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-container">
      <header className="header">
        <div className="logo-container">
          <img src="/path-to-logo/logo.png" alt="LMS Logo" className="logo" />
        </div>
        <h2>Welcome, {profile.name || "Student"}..!</h2>
        <div className="button-container">
          <button className="button profile-button">Student Profile</button>
          <button className="button logout-button">Sign out</button>
        </div>
      </header>

      <main className="profile-content">
        <div className="profile-card">
          <div className="profile-photo">
            <img
              src="/path-to-photo/user-photo.jpg"
              alt="Profile"
              className="profile-img"
            />
          </div>
          {isEditing ? (
            <div className="profile-info">
              <p>
                <strong>Name:</strong>{" "}
                <input
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                />
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <input
                  type="email"
                  name="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                />
              </p>
              <p>
                <strong>Mobile Number:</strong>{" "}
                <input
                  type="text"
                  name="mobile"
                  value={profile.mobile || ""}
                  onChange={handleChange}
                />
              </p>
              <p>
                <strong>Address:</strong>{" "}
                <textarea
                  name="address"
                  value={profile.address || ""}
                  onChange={handleChange}
                ></textarea>
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                <input
                  type="date"
                  name="dob"
                  value={profile.dob || ""}
                  onChange={handleChange}
                />
              </p>
              <button className="button save-button" onClick={handleSave}>
                Save
              </button>
            </div>
          ) : (
            <div className="profile-info">
              <p><strong>Name:</strong> {profile.name || "N/A"}</p>
              <p><strong>Email:</strong> {profile.email || "N/A"}</p>
              <p><strong>Mobile Number:</strong> {profile.mobile || "N/A"}</p>
              <p><strong>Address:</strong> {profile.address || "N/A"}</p>
              <p><strong>Date of Birth:</strong> {profile.dob || "N/A"}</p>
              <p><strong>Account Active:</strong> {profile.accountActive ? "On" : "Off"}</p>
            </div>
          )}
          <div className="profile-actions">
            <button className="button edit-button" onClick={handleEditClick}>
              Edit Profile
            </button>
            <button className="button delete-button" onClick={handleDeleteClick}>
              Delete Profile
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <a href="#" className="footer-link">About</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Contact us</a>
      </footer>
    </div>
  );
};

export default StudentProfile;
