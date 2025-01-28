import { getAuth } from "firebase/auth";
import { collection, doc, onSnapshot, setDoc, query, where} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Firebase configuration
import Sidebar from "./Sidebar1";

const TeacherAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch courses created by the logged-in teacher
  useEffect(() => {
    if (currentUser) {
      const coursesQuery = query(
        collection(db, "courses"),
        where("createdByUid", "==", currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        coursesQuery,
        (snapshot) => {
          const coursesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCourses(coursesData);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching courses:", err);
          setError("Failed to load courses. Please try again later.");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [currentUser]);

  // Fetch students enrolled in the selected course
  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      return;
    }

    const studentsQuery = query(
        collection(db, "students"),
        where("courseId", "==", selectedCourse.id)
      );
      

    const unsubscribe = onSnapshot(
      studentsQuery,
      (snapshot) => {
        const studentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsData);
      },
      (err) => {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, [selectedCourse]);

  // Handle attendance input change
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [studentId]: status,
    }));
  };

  // Submit attendance for the selected course
  const handleSubmitAttendance = async () => {
    try {
      if (Object.keys(attendance).length === 0) {
        setMessage("Please mark attendance for at least one student.");
        return;
      }

      const promises = students.map(async (student) => {
        const attendanceStatus = attendance[student.id] || "Absent";
        const attendanceDocRef = doc(
          db,
          `students/${student.id}/enrolledCourses/${selectedCourse.id}/attendance`,
          new Date().toISOString().split("T")[0] // Use the date as the document ID
        );

        await setDoc(attendanceDocRef, {
          date: new Date(),
          status: attendanceStatus,
        });
      });

      await Promise.all(promises);

      setMessage("Attendance submitted successfully!");
      setAttendance({}); // Clear attendance state
    } catch (err) {
      console.error("Error submitting attendance:", err);
      setMessage("Failed to submit attendance. Please try again.");
    }
  };

  return (
    <div className="attendance-container">
      <Sidebar />

      <div className="main-content">
        <h2>Teacher - Attendance Management</h2>

        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="courses-list">
            <h3>Select a Course</h3>
            {courses.map((course) => (
              <div
                key={course.id}
                className={`course-card ${
                  selectedCourse?.id === course.id ? "selected" : ""
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <h4>{course.title}</h4>
                <p>{course.description}</p>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="attendance-section">
            <h3>Mark Attendance for {selectedCourse.title}</h3>
            {students.length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="attendance-card">
                  <p>
                    <strong>Student Name:</strong> {student.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Student ID:</strong> {student.id}
                  </p>
                  <select
                    value={attendance[student.id] || "Absent"}
                    onChange={(e) =>
                      handleAttendanceChange(student.id, e.target.value)
                    }
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              ))
            ) : (
              <p>No students enrolled in this course.</p>
            )}
            <button onClick={handleSubmitAttendance}>Submit Attendance</button>
            {message && <p className="message">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
