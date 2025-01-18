import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, listUsers } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "./AdminDash.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", role: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userSnapshot = await getDocs(collection(db, "users"));
        const teacherSnapshot = await getDocs(collection(db, "teachers"));

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
      }
    };

    fetchUsers();
  }, [db]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="container">
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
          <li><Link to="/reports">Reports</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
        </ul>
      </nav>

      <main className="content">
        <h2 className="heading">Manage Users</h2>

        <div className="user-management">
          <h3>Teachers</h3>
          <div className="user-list">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="user-card">
                <h4>{teacher.name}</h4>
                <p>Email: {teacher.email}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="user-management">
          <h3>Students</h3>
          <div className="user-list">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <h4>{user.name}</h4>
                <p>Email: {user.email}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer1">
        <a href="#" className="footer-link">About Us</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Contact Us</a>
      </footer>
    </div>
  );
};

export default AdminDashboard;
