import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
// import "./AdminDash.css";
const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true); // Loader state
  const [error, setError] = useState(""); // Error state

  // Fetch Users and Teachers
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userSnapshot = await getDocs(collection(db, "students"));
        const teacherSnapshot = await getDocs(collection(db, "teacher"));

        const usersData = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const teachersData = teacherSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching users and teachers:", error);
        setError("Failed to fetch users and teachers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [db]);

  // Handle Sign Out
  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await signOut(auth);
        navigate("/");
      } catch (error) {
        console.error("Error signing out:", error);
        alert("An error occurred while signing out. Please try again.");
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="header">
        <h1>Admin Dashboard</h1>
        <div className="button-container">
          <button className="button logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <nav className="sidebar">
        <ul>
          <li><Link to="/manage-users">Manage Users</Link></li>
          <li><Link to="/Admin-view">Admin View</Link></li>
          <li><Link to="/suspendstudent">Suspend Student</Link></li>
          <li><Link to="/removeposts">Remove Post</Link></li>
        </ul>
      </nav>

      <main className="admin-cc">
        <h2 className="adminh1">Manage Users</h2>

        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p className="error-message6">{error}</p>
        ) : (
          <>
            <div className="user-management4">
              <h3>Teachers</h3>
              {teachers.length > 0 ? (
                <div className="user-list4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="user-card4">
                      <h4>{teacher.name}</h4>
                      <p>Email: {teacher.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No teachers found.</p>
              )}
            </div>

            <div className="user-management4">
              <h3>Students</h3>
              {users.length > 0 ? (
                <div className="user-list">
                  {users.map((user) => (
                    <div key={user.id} className="user-card">
                      <h4>{user.name}</h4>
                      <p>Email: {user.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No students found.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
