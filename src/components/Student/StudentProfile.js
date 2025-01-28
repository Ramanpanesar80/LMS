import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import "./StudentProfile.css";

function StudentProfile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    dateOfBirth: "",
    mobileNumber: "",
    profilePicture: "", // For storing the profile picture URL
  });
  const [loading, setLoading] = useState(true);
  const [profilePicFile, setProfilePicFile] = useState(null); // For file input
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        alert("User not authenticated");
        return;
      }

      const userRef = doc(db, "students", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        alert("User data not found.");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!auth.currentUser) {
      alert("User not authenticated");
      return;
    }

    // Validate date
    const today = new Date().toISOString().split("T")[0];
    if (userData.dateOfBirth > today) {
      alert("Date of birth cannot be in the future.");
      return;
    }

    try {
      const userRef = doc(db, "students", auth.currentUser.uid);

      // If a profile picture file is selected, upload it to Firebase Storage
      if (profilePicFile) {
        const profilePicRef = ref(
          storage,
          `profile-pictures/${auth.currentUser.uid}`
        );
        await uploadBytes(profilePicRef, profilePicFile);
        const profilePicURL = await getDownloadURL(profilePicRef);
        userData.profilePicture = profilePicURL; // Update profile picture URL in user data
      }

      await updateDoc(userRef, userData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return loading ? (
    <p>Loading...</p>
  ) : (
    <div>
      <div className="profile-container">

      <h1>Profile</h1>
      <input
        type="text"
        name="name"
        value={userData.name}
        onChange={handleInputChange}
        placeholder="Name"
      />
      <input
        type="email"
        name="email"
        value={userData.email}
        onChange={handleInputChange}
        placeholder="Email"
      />
      <input
        type="text"
        name="address"
        value={userData.address}
        onChange={handleInputChange}
        placeholder="Address"
      />
      <input
        type="date"
        name="dateOfBirth"
        value={userData.dateOfBirth}
        onChange={handleInputChange}
      />
      <input
        type="tel"
        name="mobileNumber"
        value={userData.mobileNumber}
        onChange={handleInputChange}
        placeholder="Mobile Number"
      />

      <div>
        <label>Profile Picture:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePicFile(e.target.files[0])}
        />
      </div>

      {userData.profilePicture && (
        <div>
          <img
            src={userData.profilePicture}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
      )}

      <div>
        <button onClick={handleUpdate}>Update Profile</button>
        <button onClick={handleBack}>Back</button>
      </div>
      </div>
    </div>
  );
}

export default StudentProfile;
