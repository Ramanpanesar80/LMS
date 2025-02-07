import React, { useEffect, useState } from "react";
import { getAuth ,signOut} from "firebase/auth";
import { db } from "../../firebase"; 
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import './Adminpermission.css';
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
   const navigate = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        const studentList = [];
        querySnapshot.forEach((doc) => {
          studentList.push({ id: doc.id, ...doc.data() });
        });
        setStudents(studentList);
      } catch (err) {
        setError("Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const togglePermission = async (studentId, hasPermission) => {
    try {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, { permission: hasPermission ? "student" : "none" });

      setStudents(
        students.map((student) =>
          student.id === studentId
            ? { ...student, permission: hasPermission ? "student" : "none" }
            : student
        )
      );
    } catch (err) {
      setError("Failed to update student permissions.");
    }
  };
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
    <div className="admin-dashboard">
      <header className="list-header">
      <h1 className="preet-mana">Admin Dashboard</h1>
        <div className="button-list">
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <nav className="sidebar-admin">
        <ul>
        <li><Link to="/manage-users">Manage Users</Link></li>
          <li><Link to="/Admin-view">Admin View</Link></li>
          <li><Link to="/suspendstudent">Suspend Student</Link></li>
          <li><Link to="/removeposts">Remove Post</Link></li>
          <li><Link to="/flagged ">Flagged content</Link></li>
          <li><Link to="/control ">Admin Control</Link></li>
          <li><Link to="/permission ">Admin permissions</Link></li>
          <li><Link to="/platform ">Admin platform</Link></li>
          <li><Link to="/profile ">Student profile set</Link></li>
        </ul>
      </nav>
      {loading ? (
        <p>Loading students...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="student-list">
          <table className="pl">
            <thead>
              <tr>
                <th>Email</th>
                <th>Permission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.email}</td>
                  <td>{student.permission === "student" ? "Granted" : "Not Granted"}</td>
                  <td>
                    <button className="per"
                      onClick={() => togglePermission(student.id, student.permission !== "student")}
                    >
                      {student.permission === "student" ? "Revoke Permission" : "Grant Permission"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
