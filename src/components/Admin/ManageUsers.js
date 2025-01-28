import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import "./ManageUsers.css";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const auth = getAuth();

  // Fetch users from their respective collections
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsData);

        // Fetch teachers
        const teachersSnapshot = await getDocs(collection(db, "teacher"));
        const teachersData = teachersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeachers(teachersData);

        // Fetch admins
        const adminsSnapshot = await getDocs(collection(db, "admin"));
        const adminsData = adminsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdmins(adminsData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Add new user to Firebase Authentication and Firestore
  const handleAddUser = async () => {
    if (newUser.name && newUser.email && newUser.password && newUser.role) {
      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          newUser.email,
          newUser.password
        );
        const userId = userCredential.user.uid;

        // Determine Firestore collection based on role
        const roleCollection =
          newUser.role === "Student"
            ? "students"
            : newUser.role === "Teacher"
            ? "teacher"
            : "admin";

        // Add user to Firestore
        const docRef = doc(db, roleCollection, userId);
        await setDoc(docRef, {
          uid: userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          ...(newUser.role === "Teacher" && { passwordChanged: false }),
        });

        // Update the respective state
        if (newUser.role === "Student") {
          setStudents((prev) => [...prev, { id: userId, ...newUser }]);
        } else if (newUser.role === "Teacher") {
          setTeachers((prev) => [...prev, { id: userId, ...newUser }]);
        } else {
          setAdmins((prev) => [...prev, { id: userId, ...newUser }]);
        }

        setNewUser({ name: "", email: "", password: "", role: "" });

        alert(`User added successfully to the ${roleCollection} collection!`);
      } catch (error) {
        console.error("Error adding user:", error);
        alert("Failed to add user. Please try again.");
      }
    } else {
      alert("Please fill in all fields!");
    }
  };

  // Delete user from Firestore
  const handleDeleteUser = async (id, role) => {
    const roleCollection =
      role === "Student" ? "students" : role === "Teacher" ? "teacher" : "admin";

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, roleCollection, id));

        // Update the respective state
        if (role === "Student") {
          setStudents((prev) => prev.filter((user) => user.id !== id));
        } else if (role === "Teacher") {
          setTeachers((prev) => prev.filter((user) => user.id !== id));
        } else {
          setAdmins((prev) => prev.filter((user) => user.id !== id));
        }

        alert("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  // Sign out admin
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
      alert("Successfully signed out!");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("An error occurred while signing out. Please try again.");
    }
  };

  return (
    <div className="manager">
      <header className="list-header">
        <h1 className="preet">Admin Dashboard</h1>
        <div className="button-list">
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <nav className="sidebar3">
        <ul>
        <li><Link to="/manage-users">Manage Users</Link></li>
          <li><Link to="/adminview">Admin View</Link></li>
          <li><Link to="/suspendstudent">Suspend Student</Link></li>
          <li><Link to="/removeposts">Remove Post</Link></li>
          <li><Link to="/flagged ">Flagged content</Link></li>
          <li><Link to="/control ">Admin Control</Link></li>
        </ul>
      </nav>

      <main className="manager-content">
        <h2 className="manager-heading">Manage Users</h2>
        <div className="user-manage">
          <h3 className="mani">Add New User</h3>
          <div className="add-user-form2">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
            <button className="button-manager" onClick={handleAddUser}>
              Add User
            </button>
          </div>

          {/* Display Students */}
          <h3 className="man">Student List</h3>
          <div className="user-list-man">
            {students.map((student) => (
              <div key={student.id} className="user-card-man">
                <h4>{student.name}</h4>
                <p>Email: {student.email}</p>
                <p>Role: {student.role}</p>
                <button
                  className="button delete"
                  onClick={() => handleDeleteUser(student.id, "Student")}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Display Teachers */}
          <h3 className="man">Teacher List</h3>
          <div className="user-list-man">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="user-card-man">
                <h4>{teacher.name}</h4>
                <p>Email: {teacher.email}</p>
                <p>Role: {teacher.role}</p>
                <button
                  className="button delete"
                  onClick={() => handleDeleteUser(teacher.id, "Teacher")}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Display Admins */}
          <h3 className="man">Admin List</h3>
          <div className="user-list-man">
            {admins.map((admin) => (
              <div key={admin.id} className="user-card-man">
                <h4>{admin.name}</h4>
                <p>Email: {admin.email}</p>
                <p>Role: {admin.role}</p>
                {/* <button
                  className="button delete"
                  onClick={() => handleDeleteUser(admin.id, "Admin")}
                >
                  Delete
                </button> */}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer-manager">
        <a href="#" className="footer-link">About Us</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Contact Us</a>
      </footer>
    </div>
  );
};

export default ManageUsers;
