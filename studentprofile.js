import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "./StudentProfile.css";

function StudentProfile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    dateOfBirth: "",
    mobileNumber: "",
    profilePicture: "",
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, "students", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, "students", auth.currentUser.uid);

      if (profilePicFile) {
        const profilePicRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
        await uploadBytes(profilePicRef, profilePicFile);
        const profilePicURL = await getDownloadURL(profilePicRef);
        userData.profilePicture = profilePicURL;
      }

      await updateDoc(userRef, userData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!auth.currentUser || !userData.profilePicture) return;

    setUserData((prev) => ({ ...prev, profilePicture: "" })); 

    try {
      const profilePicRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
      await deleteObject(profilePicRef); 
    } catch (error) {
      console.warn("Failed to delete from storage, but proceeding:", error);
    }

    try {
      const userRef = doc(db, "students", auth.currentUser.uid);
      await updateDoc(userRef, { profilePicture: "" }); 
      alert("Profile picture removed!");
    } catch (error) {
      console.error("Failed to update Firestore:", error);
      alert("Could not update profile picture in database.");
    }
  };
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="profile-container">
      <header className="list-header-prof">
        <h1 className="preet-prof">Student Dashboard</h1>
      </header>
      
      <h1 className="profielj">Edit Profile</h1>
      <input type="text" name="name" value={userData.name} onChange={handleInputChange} placeholder="Name" />
      <input type="email" name="email" value={userData.email} onChange={handleInputChange} placeholder="Email" />
      <input type="text" name="address" value={userData.address} onChange={handleInputChange} placeholder="Address" />
      <input type="date" name="dateOfBirth" value={userData.dateOfBirth} onChange={handleInputChange} />
      <input type="tel" name="mobileNumber" value={userData.mobileNumber} onChange={handleInputChange} placeholder="Mobile Number" />

      {userData.profilePicture ? (
        <div>
          <img src={userData.profilePicture} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
          <button onClick={handleRemoveProfilePicture} className="remove-profile">Remove</button>

        </div>
      ) : (
        <p>No profile picture</p>
      )}

      <button onClick={handleUpdate}>Update Profile</button>
      <button onClick={() => navigate("/nextpage")}>Update Profile Picture</button>
      <button onClick={handleGoBack} className="profile-actions">Back</button>
    </div>
  );
}

export default StudentProfile;
