import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Firebase setup
import { doc, updateDoc, getDocs, collection } from "firebase/firestore"; 
// import "./SuspendStudent.css"; 

function AdminSuspendStudent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch all users from the "users" collection in Firestore
        const usersSnapshot = await getDocs(collection(db, "students"));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to load users.");
      }
    };

    fetchUsers();
  }, []);

  // Handle suspend/unsuspend
  const handleSuspend = async (userId, suspended) => {
    try {
      const userRef = doc(db, "students", userId);
      await updateDoc(userRef, {
        suspended: !suspended, // Toggle suspension
      });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, suspended: !suspended } : user
        )
      );
      alert(`User ${!suspended ? "suspended" : "unsuspended"} successfully.`);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status.");
    }
  };

  return loading ? (
    <p>Loading users...</p>
  ) : (
    <div>
      <h1>Manage Users</h1>
      {users.length === 0 ? (
        <p>No users available.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id} style={{ marginBottom: "20px" }}>
              <h3>{user.displayName}</h3>
              <p>{user.email}</p>
              <p>Status: {user.suspended ? "Suspended" : "Active"}</p>
              <button onClick={() => handleSuspend(user.id, user.suspended)}>
                {user.suspended ? "Unsuspend" : "Suspend"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminSuspendStudent;
