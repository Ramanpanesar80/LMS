import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./AdminDash.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userSnapshot = await getDocs(collection(db, "users"));
        const usersData = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUser.email || !newUser.password || !newUser.role) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Step 1: Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const createdUser = userCredential.user;

      // Step 2: Add user details to Firestore
      await addDoc(collection(db, "users"), {
        uid: createdUser.uid,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date(),
      });

      alert("User created successfully!");
      setNewUser({ email: "", password: "", role: "" });
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Remove user details from Firestore
        await deleteDoc(doc(db, "users", userId));
        alert("User deleted successfully.");
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

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
          <li><Link to="/admin-dashboard">Manage Users</Link></li>
          <li><Link to="/reports">Reports</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
        </ul>
      </nav>

      <main className="content">
        <h2 className="heading">Manage Users</h2>

        <div className="create-user-form">
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser}>
            <label>
              Email:
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </label>
            <label>
              Role:
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                required
              >
                <option value="">Select Role</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </label>
            <button type="submit" className="button create-user">Create User</button>
          </form>
        </div>

        <div className="user-management">
          <h3>Users</h3>
          <div className="user-list">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <h4>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h4>
                <p>Email: {user.email}</p>
                <button
                  className="button delete-user"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </button>
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
