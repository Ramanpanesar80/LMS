import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import "./StudentProfileset.css";
import { Link, useNavigate } from "react-router-dom";


function Adminprofile() {
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

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    dateOfBirth: '',
    mobileNumber: '',
  });

 
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      address: student.address,
      dateOfBirth: student.dateOfBirth,
      mobileNumber: student.mobileNumber,
    });
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

 
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
     
      const studentRef = doc(db, "students", selectedStudent.id);
      await updateDoc(studentRef, formData);

   
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, ...formData }
            : student
        )
      );
      alert('Student profile updated successfully!');
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student profile.");
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
    <div className="pp">
           <header className="list-header">
      <h1 className="preet-mana">Admin Dashboard</h1>
        <div className="button-list">
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>
      <h1 className="admin-pp">Student Profiles</h1>

   
      <div>
        <h2 className="kn">All Students</h2>
        <ul className="lx">
          {students.map((student) => (
            <li key={student.id} onClick={() => handleSelectStudent(student)} className="lb">
              {student.name}
            </li>
          ))}
        </ul>
      </div>
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

    
      {selectedStudent && (
        <div className="xz">
          <h2>Update {selectedStudent.name}'s Profile</h2>
          <form onSubmit={handleUpdateStudent} className="jm">
            <div>
              <label>Name:</label>
              <input
              className="na"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Email:</label>
              <input
              className="ba"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Address:</label>
              <input
              className="ns"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Date of Birth:</label>
              <input
              className="nbv"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Mobile Number:</label>
              <input
              className="ax"
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="vc">Update Profile</button>
          </form>
        </div>
      )}

      
      {selectedStudent && (
        <div className="bf">
          <h3>Student Details</h3>
          <p><strong>Name:</strong> {selectedStudent.name}</p>
          <p><strong>Email:</strong> {selectedStudent.email}</p>
          <p><strong>Address:</strong> {selectedStudent.address}</p>
          <p><strong>Date of Birth:</strong> {selectedStudent.dateOfBirth}</p>
          <p><strong>Mobile Number:</strong> {selectedStudent.mobileNumber}</p>
        </div>
      )}
    </div>
  );
}

export default Adminprofile;
