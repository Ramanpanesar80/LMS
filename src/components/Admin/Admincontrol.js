import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust the import path based on your file structure
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const Admincontrol = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Fetch students from Firestore
    const fetchStudents = async () => {
      const studentsCollection = collection(db, 'students');
      const studentsSnapshot = await getDocs(studentsCollection);
      const studentList = studentsSnapshot.docs.map(doc => ({
        id: doc.id, // Add the document ID
        ...doc.data()
      }));
      setStudents(studentList);
    };

    fetchStudents();
  }, []);

  // Toggle student activation status
  const toggleStudentStatus = async (id, currentStatus) => {
    try {
      const studentRef = doc(db, 'students', id);
      const newStatus = !currentStatus; // Toggle the status (if true, set to false and vice versa)
      await updateDoc(studentRef, { isActive: newStatus }); // Update the isActive field
      setStudents(students.map(student => 
        student.id === id ? { ...student, isActive: newStatus } : student
      )); // Update the state to reflect the change
    } catch (error) {
      console.error("Error updating student status: ", error);
    }
  };

  return (
    <div>
      <h1>Student Accounts</h1>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.isActive ? 'Active' : 'Deactivated'}</td>
                <td>
                  <button onClick={() => toggleStudentStatus(student.id, student.isActive)}>
                    {student.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admincontrol;
