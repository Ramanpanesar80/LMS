import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; 
import { useNavigate } from "react-router-dom";
import "./Grade.css";

const Grades = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "courses"),
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
  }, []);

  
  useEffect(() => {
    if (selectedCourse) {
      const unsubscribe = onSnapshot(
        collection(db, `courses/${selectedCourse.id}/students`),
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
    }
  }, [selectedCourse]);

  
  const handleGradeChange = (studentId, grade) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [studentId]: grade,
    }));
  };

  
  const handleSaveGrades = async () => {
    try {
      if (!selectedCourse) {
        alert("Please select a course before saving grades.");
        return;
      }

      if (Object.keys(grades).length === 0) {
        alert("No grades to save.");
        return;
      }

      const updatePromises = Object.entries(grades).map(async ([studentId, grade]) => {
        
        const studentDocRef = doc(db, `courses/${selectedCourse.id}/students`, studentId);
        await updateDoc(studentDocRef, { grade });

        
        const stsDocRef = doc(db, "sts", studentId);
        await setDoc(
          stsDocRef,
          {
            grades: {
              [selectedCourse.id]: grade,
            },
          },
          { merge: true } 
        );
      });

      await Promise.all(updatePromises);
      alert("Grades successfully uploaded!");
    } catch (err) {
      console.error("Error saving grades:", err);
      setError("Failed to upload grades. Please try again.");
    }
  };

  return (
    <div className="upload-grades-container">
      <div className="sidebar">
        <ul>
          <li>
            <button onClick={() => navigate("/teacherdash")}>Dashboard</button>
          </li>
          <li>
            <button onClick={() => navigate("/upload-grades")}>Upload Grades</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <h2>Teacher - Upload Grades</h2>

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
                className={`course-card ${selectedCourse?.id === course.id ? "selected" : ""}`}
                onClick={() => setSelectedCourse(course)}
              >
                <h4>{course.title}</h4>
                <p>{course.description}</p>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="students-list">
            <h3>Students in {selectedCourse.title}</h3>
            {students.length > 0 ? (
              <>
                {students.map((student) => (
                  <div key={student.id} className="student-card">
                    <p>Student Name: {student.name}</p>
                    <p>Student ID: {student.id}</p>
                    <input
                      type="text"
                      placeholder="Enter grade"
                      value={grades[student.id] || ""}
                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                    />
                  </div>
                ))}
                <button onClick={handleSaveGrades} className="save-grades-button">
                  Save Grades
                </button>
              </>
            ) : (
              <p>No students found for this course.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;
