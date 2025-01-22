import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { updateProfile, deleteUser } from "firebase/auth"; // Import deleteUser function
// import "./StudentProfile.css";

function StudentProfile() {
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);

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
        // If the document exists, set user data
        setUserData(userDoc.data());
      } else {
        // If the document does not exist, create it with default values
        await setDoc(userRef, {
          displayName: "",
          email: auth.currentUser.email,
          bio: "",
        });
        alert("User document created!");
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

    // Ensure the fields are not empty before proceeding
    if (!userData.displayName || !userData.email) {
      alert("Display name or email is missing");
      return;
    }

    const userRef = doc(db, "students", auth.currentUser.uid);

    try {
      // Update Firestore document
      await updateDoc(userRef, userData);

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: userData.displayName,
        email: userData.email, // Update email in Firebase Auth
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`An error occurred while updating the profile: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // Delete Firestore user document
        const userRef = doc(db, "students", auth.currentUser.uid);
        await deleteDoc(userRef);

        // Delete the Firebase user from Authentication
        await deleteUser(auth.currentUser);

        alert("Your account has been deleted successfully.");
        // Optionally redirect the user to the home page or login page
        // e.g., window.location.href = "/login";
      } catch (error) {
        console.error("Error deleting account:", error);
        alert(`An error occurred while deleting the account: ${error.message}`);
      }
    }
  };

  return loading ? (
    <p>Loading...</p>
  ) : (
    <div>
      <h1>Profile</h1>
      <input
        type="text"
        name="displayName"
        value={userData.displayName}
        onChange={handleInputChange}
        placeholder="Display Name"
      />
 <input
  type="email"
  name="email"
  value={userData.email}
  onChange={handleInputChange}
  placeholder="Email"
/>


      <textarea
        name="bio"
        value={userData.bio}
        onChange={handleInputChange}
        placeholder="Bio"
      />
      <div>
        <button onClick={handleUpdate}>Update Profile</button>
        <button onClick={handleDelete}>Delete Profile</button>
      </div>
    </div>
  );
}

export default StudentProfile;
