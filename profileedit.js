import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase"; // Ensure correct imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import "./StudentProfile.css";

function EditProfilePicture() {
  const [userData, setUserData] = useState({
    profilePicture: "", // Manage profile picture URL
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [message, setMessage] = useState(""); // For success/error messages
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        setMessage("User is not authenticated.");
        return;
      }

      const userRef = doc(db, "students", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        setMessage("User profile not found.");
      }
    };

    fetchUserData();
  }, []);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Convert the image file to Base64 format
        setProfilePicFile(reader.result);
      };
      reader.readAsDataURL(file); // Convert file to Base64
    }
  };

  const handleUpdateProfilePic = async () => {
    if (!auth.currentUser || !profilePicFile) {
      setMessage("Please select a profile picture.");
      return;
    }

    try {
      // Get reference to user's document in Firestore
      const userRef = doc(db, "students", auth.currentUser.uid);

      // Update the user's Firestore document with the Base64 string of the profile picture
      await updateDoc(userRef, {
        profilePicture: profilePicFile, // Store the Base64 string
      });

      // Update the state with the new profile picture URL
      setUserData((prevData) => ({
        ...prevData,
        profilePicture: profilePicFile,
      }));

      setMessage("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setMessage("Failed to update profile picture. Please try again.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Edit Profile Picture</h2>

      <div>
        <label>Profile Picture:</label>
        <input type="file" accept="image/*" onChange={handleProfilePicChange} />
      </div>

      {userData.profilePicture ? (
        <div>
          <img
            src={userData.profilePicture}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
      ) : (
        <p>No profile picture</p>
      )}

      <button onClick={handleUpdateProfilePic}>Update Profile Picture</button>

      {/* Displaying the message */}
      {message && <p>{message}</p>}

      {/* Back button */}
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

export default EditProfilePicture;
