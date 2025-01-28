import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
// import "./ViewProfile.css";

function ViewProfile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    dateOfBirth: "",
    mobileNumber: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpdateProfile = () => {
    navigate("/StudentProfile");
  };

  return loading ? (
    <p>Loading...</p>
  ) : (
    <div className="view-profile-container">
      <h1>View Profile</h1>
      <div className="profile-picture">
        {userData.profilePicture ? (
          <img src={userData.profilePicture} alt="Profile" />
        ) : (
          <p>No profile picture available</p>
        )}
      </div>
      <div className="profile-details">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Address:</strong> {userData.address}</p>
        <p><strong>Date of Birth:</strong> {userData.dateOfBirth}</p>
        <p><strong>Mobile Number:</strong> {userData.mobileNumber}</p>
      </div>
      <div className="profile-actions">
        <button onClick={handleUpdateProfile}>Update Profile</button>
        <button onClick={handleBack} className="back-button">Back</button>
      </div>
    </div>
  );
}

export default ViewProfile;
