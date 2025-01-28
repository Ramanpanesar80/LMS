import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";

function AdminSuspendStudent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch students from the "students" collection
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

  // Handle suspend/unsuspend student
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

  return loading ? (
    <p>Loading students...</p>
  ) : (
    <div>
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
    </div>
  );
}

export default AdminSuspendStudent;
