import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./ViewProfile.css";

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
  const auth = getAuth();

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

  const handleUpdateProfile = () => {
    navigate("/StudentProfile");
  };

 

  const handleDeleteProfile = async () => {
    if (!auth.currentUser) return;

    const confirmDelete = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "students", auth.currentUser.uid));
      await signOut(auth);
      alert("Profile deleted successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete profile. Please try again.");
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return loading ? (
    <p>Loading...</p>
  ) : (
    <div className="view-profile-container">
      <header className="list-header-prof">
        <h1 className="preet-prof">Student Dashboard</h1>
      </header>
      
      <h1 className="profielj">View Profile</h1>

      <div className="profile-picture">
        {userData.profilePicture ? (
          <img src={userData.profilePicture} alt="Profile" className="profile-img" />
        ) : (
          <img src="/default-avatar.png" alt="Default Profile" className="profile-img" />
        )}
      </div>

      <div className="profile-details">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Address:</strong> {userData.address}</p>
        <p><strong>Date of Birth:</strong> {userData.dateOfBirth}</p>
        <p><strong>Mobile Number:</strong> {userData.mobileNumber}</p>
      </div>

      <button onClick={handleUpdateProfile} className="profile-actions">Update Profile</button>
      <button onClick={handleDeleteProfile} className="profile-actions delete">Delete Profile</button>
      <button onClick={handleGoBack} className="profile-actions">Back</button>
    </div>
  );
}

export default ViewProfile;
