import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function TeacherProfile() {
  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!auth.currentUser) {
        alert("User not authenticated");
        return;
      }

      const teacherRef = doc(db, "teacher", auth.currentUser.uid);
      const teacherDoc = await getDoc(teacherRef);

      if (teacherDoc.exists()) {
        setTeacherData(teacherDoc.data());
      } else {
        alert("Teacher data not found.");
      }
      setLoading(false);
    };

    fetchTeacherData();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpdateProfile = () => {
    navigate("/TeacherUpdateProfile");
  };

  return loading ? (
    <p>Loading...</p>
  ) : (
    <div className="view-profile-container">
      <h1>Teacher Profile</h1>
      <div className="profile-picture">
        {teacherData.profilePicture ? (
          <img src={teacherData.profilePicture} alt="Profile" />
        ) : (
          <p>No profile picture available</p>
        )}
      </div>
      <div className="profile-details">
        <p><strong>Name:</strong> {teacherData.name}</p>
        <p><strong>Email:</strong> {teacherData.email}</p>
      </div>
      <div className="profile-actions">
        <button onClick={handleUpdateProfile}>Update Profile</button>
        <button onClick={handleBack} className="back-button">Back</button>
      </div>
    </div>
  );
}

export default TeacherProfile;
