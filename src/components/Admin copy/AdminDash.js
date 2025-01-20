import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import "./AdminDash.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [users, setUsers] = useState([]); // Firestore users
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "" });
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchFirestoreUsers = async () => {
      try {
        const teacherSnapshot = await getDocs(collection(db, "teacher"));
        const studentSnapshot = await getDocs(collection(db, "students"));

        const teacherData = teacherSnapshot.docs.map((doc) => ({
          id: doc.id,
          role: "teacher",
          ...doc.data(),
        }));
        const studentData = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          role: "student",
          ...doc.data(),
        }));

        setUsers([...teacherData, ...studentData]);
      } catch (error) {
        console.error("Error fetching Firestore users:", error);
      }
    };

    fetchFirestoreUsers();
  }, []);

  // Handle creating a user
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

      // Step 2: Add user to the respective Firestore collection
      const collectionName = newUser.role === "teacher" ? "teacher" : "students";
      await addDoc(collection(db, collectionName), {
        uid: createdUser.uid,
        email: newUser.email,
        role: newUser.role,
        status: "active", // Default status
        createdAt: new Date(),
      });

      alert("User created successfully!");
      setNewUser({ email: "", password: "", role: "" });

      // Refresh the user list
      setUsers([...users, { id: createdUser.uid, role: newUser.role, email: newUser.email, status: "active" }]);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
    }
  };

  // Handle updating a user
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editingUser.email || !editingUser.role) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const collectionName = editingUser.role === "teacher" ? "teacher" : "students";
      const userDoc = doc(db, collectionName, editingUser.id);

      await updateDoc(userDoc, { email: editingUser.email, role: editingUser.role });

      alert("User updated successfully!");

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...user, email: editingUser.email, role: editingUser.role } : user
        )
      );

      setEditingUser(null); // Clear editing state
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  // Handle canceling the update
  const handleCancelUpdate = () => {
    setEditingUser(null); // Clear editing state
  };

  // Handle suspending a user
  const handleSuspendUser = async (user) => {
    if (window.confirm(`Are you sure you want to suspend ${user.email}?`)) {
      try {
        const collectionName = user.role === "teacher" ? "teacher" : "students";
        const userDoc = doc(db, collectionName, user.id);

        await updateDoc(userDoc, { status: "suspended" });

        alert("User suspended successfully!");

        // Update local state
        setUsers(
          users.map((u) =>
            u.id === user.id ? { ...u, status: "suspended" } : u
          )
        );
      } catch (error) {
        console.error("Error suspending user:", error);
        alert("Failed to suspend user. Please try again.");
      }
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (user) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const collectionName = user.role === "teacher" ? "teacher" : "students";

        // Delete from Firestore
        await deleteDoc(doc(db, collectionName, user.id));

        alert("User deleted successfully.");
        setUsers(users.filter((u) => u.id !== user.id));
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
          <h3>{editingUser ? "Edit User" : "Create New User"}</h3>
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
            <label>
              Email:
              <input
                type="email"
                value={editingUser ? editingUser.email : newUser.email}
                onChange={(e) =>
                  editingUser
                    ? setEditingUser({ ...editingUser, email: e.target.value })
                    : setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
            </label>
            {!editingUser && (
              <>
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
              </>
            )}
            <button type="submit" className="button create-user">
              {editingUser ? "Update User" : "Create User"}
            </button>
            {editingUser && (
              <button
                type="button"
                className="button cancel"
                onClick={handleCancelUpdate}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="user-management">
          <h3>Users</h3>
          <div className="user-list">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <h4>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h4>
                <p>Email: {user.email}</p>
                <p>Status: {user.status}</p>
                <button
                  className="button edit-user"
                  onClick={() => setEditingUser(user)}
                >
                  Edit
                </button>
                <button
                  className="button delete-user"
                  onClick={() => handleDeleteUser(user)}
                >
                  Delete
                </button>
                <button
                  className="button suspend-user"
                  onClick={() => handleSuspendUser(user)}
                >
                  Suspend
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
