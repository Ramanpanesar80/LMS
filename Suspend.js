import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./SuspendStudent.css";

function AdminSuspendStudent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const studentsList = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        alert("Failed to load students.");
      }
    };

    fetchStudents();
  }, []);

  
  const handleSuspend = async (studentId, suspended) => {
    try {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, {
        suspended: !suspended,
      });
      setStudents(
        students.map((student) =>
          student.id === studentId
            ? { ...student, suspended: !suspended }
            : student
        )
      );
      alert(`Student ${!suspended ? "suspended" : "unsuspended"} successfully.`);
    } catch (error) {
      console.error("Error updating student status:", error);
      alert("Failed to update student status.");
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

  return loading ? (
    <p>Loading students...</p>
  ) : (
    <div>

<header className="list-header">
        
        <div className="button-list">
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      {/* <nav className="sidebar-admin-sus">
        <ul>
        <li><Link to="/manage-users">Manage Users</Link></li>
          <li><Link to="/adminview">Admin View</Link></li>
          <li><Link to="/suspendstudent">Suspend Student</Link></li>
          <li><Link to="/removeposts">Remove Post</Link></li>
          <li><Link to="/flagged ">Flagged content</Link></li>
          <li><Link to="/control ">Admin Control</Link></li>
        </ul>
      </nav> */}
      <h1>Manage Students</h1>
      {students.length === 0 ? (
        <p>No students available.</p>
      ) : (
        <ul>
          {students.map((student) => (
            <li key={student.id} style={{ marginBottom: "20px" }}>
              <h3>{student.name || "No Name"}</h3>
              <p>{student.email}</p>
              <p>Status: {student.suspended ? "Suspended" : "Active"}</p>
              <button
                onClick={() => handleSuspend(student.id, student.suspended)}
              >
                {student.suspended ? "Unsuspend" : "Suspend"}
              </button>
            </li>
          ))}
        </ul>
      )}

<footer className="footer-manager-sus">
        <a href="#" className="footer-link-sus">About Us</a>
        <a href="#" className="footer-link-sus">Privacy Policy</a>
        <a href="#" className="footer-link-sus">Terms and Conditions</a>
        <a href="#" className="footer-link-sus">Contact Us</a>
      </footer>
    </div>
  );
}

export default AdminSuspendStudent;
