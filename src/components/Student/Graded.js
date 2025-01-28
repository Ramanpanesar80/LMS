import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase"; // Firebase configuration
import Sidebar from "./Sidebar";

const Graded = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [gradedAssignments, setGradedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch courses the student is enrolled in
  useEffect(() => {
    if (currentUser) {
      const coursesQuery = query(
        collection(db, `students/${currentUser.uid}/enrolledCourses`)
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

  // Fetch graded assignments for the selected course
  useEffect(() => {
    if (!selectedCourse) {
      setGradedAssignments([]);
      return;
    }

    const fetchGradedAssignments = async () => {
      try {
        const gradesQuery = collection(
          db,
          `students/${currentUser.uid}/enrolledCourses/${selectedCourse.id}/grades`
        );

        const unsubscribe = onSnapshot(
          gradesQuery,
          async (snapshot) => {
            const gradedData = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const gradeInfo = { id: doc.id, ...doc.data() };

                // Fetch the assignment details
                try {
                  const assignmentDoc = await getDoc(
                    doc(db, `uploads/${selectedCourse.id}/assignments`, doc.id)
                  );
                  gradeInfo.assignmentTitle = assignmentDoc.exists()
                    ? assignmentDoc.data().title
                    : "Unknown Assignment";
                  gradeInfo.assignmentDescription = assignmentDoc.exists()
                    ? assignmentDoc.data().description
                    : "No description available.";
                } catch (error) {
                  console.error(`Error fetching assignment for ID ${doc.id}:`, error);
                }

                return gradeInfo;
              })
            );

            setGradedAssignments(gradedData);
          },
          (err) => {
            console.error("Error fetching graded assignments:", err);
            setError("Failed to load graded assignments. Please try again later.");
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching graded assignments:", err);
        setError("Failed to load graded assignments. Please try again later.");
      }
    };

    fetchGradedAssignments();
  }, [selectedCourse, currentUser]);

  return (
    <div className="graded-assignments-container">
      <Sidebar />

      <div className="main-content">
        <h2>Student - View Graded Assignments</h2>

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
          <div className="graded-assignments-list">
            <h3>Graded Assignments for {selectedCourse.title}</h3>
            {gradedAssignments.length > 0 ? (
              gradedAssignments.map((assignment) => (
                <div key={assignment.id} className="graded-assignment-card">
                  <p>
                    <strong>Title:</strong> {assignment.assignmentTitle}
                  </p>
                  <p>
                    <strong>Description:</strong> {assignment.assignmentDescription}
                  </p>
                  <p>
                    <strong>Grade:</strong> {assignment.grade || "Not graded yet"}
                  </p>
                  <p>
                    <strong>Feedback:</strong>{" "}
                    {assignment.feedback || "No feedback provided"}
                  </p>
                </div>
              ))
            ) : (
              <p>No graded assignments found for this course.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Graded;
