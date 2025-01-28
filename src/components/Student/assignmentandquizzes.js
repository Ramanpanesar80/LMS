import { getAuth, signOut } from "firebase/auth";
import { addDoc, collection, doc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import "./assignmentandquizzes.css";

const Assignmentsandquizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch courses for the logged-in student
  useEffect(() => {
    if (currentUser) {
      const fetchCourses = async () => {
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
          },
          (err) => {
            console.error("Error fetching courses:", err);
            setMessage("Failed to load courses. Please try again later.");
          }
        );

        return () => unsubscribe();
      };

      fetchCourses();
    }
  }, [currentUser]);

  // Fetch assignments for the selected course
  useEffect(() => {
    if (selectedCourse) {
      const teacherAssignmentsRef = collection(
        db,
        `courses/${selectedCourse.id}/assignments`
      );

      const studentAssignmentsRef = query(
        collection(db, `uploads/${selectedCourse.id}/assignments`),
        where("studentId", "==", currentUser.uid)
      );

      const unsubscribeTeacher = onSnapshot(
        teacherAssignmentsRef,
        (snapshot) => {
          const assignmentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTeacherAssignments(assignmentsData);
        },
        (err) => {
          console.error("Error fetching teacher assignments:", err);
          setMessage("Failed to load assignments. Please try again later.");
        }
      );

      const unsubscribeStudent = onSnapshot(
        studentAssignmentsRef,
        (snapshot) => {
          const assignmentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStudentAssignments(assignmentsData);
        },
        (err) => {
          console.error("Error fetching student assignments:", err);
          setMessage("Failed to load assignments. Please try again later.");
        }
      );

      return () => {
        unsubscribeTeacher();
        unsubscribeStudent();
      };
    }
  }, [selectedCourse, currentUser]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!file && !description) {
      setMessage("Please select a file or provide a description.");
      return;
    }
  
    try {
      // Check if the student has already submitted this assignment
      const submissionsQuery = query(
        collection(db, `uploads/${selectedCourse.id}/assignments`),
        where("studentId", "==", currentUser.uid),
        where("assignmentId", "==", selectedAssignment.id)
      );
  
      const submissionsSnapshot = await onSnapshot(submissionsQuery, (snapshot) => {
        if (!snapshot.empty) {
          setMessage("You have already submitted this assignment.");
          return;
        }
  
        // If no existing submission, proceed with submission
        const submitAssignment = async () => {
          // Add the assignment submission to Firestore
          const newSubmission = await addDoc(
            collection(db, `uploads/${selectedCourse.id}/assignments`),
            {
              title: file ? file.name : "No file",
              description: description,
              submittedAt: new Date(),
              studentId: currentUser.uid,
              studentName: currentUser.displayName,
              assignmentId: selectedAssignment.id,
            }
          );
  
          // Add a corresponding grade entry in the grades subcollection
          const gradeDocRef = doc(
            db,
            `students/${currentUser.uid}/enrolledCourses/${selectedCourse.id}/grades`,
            selectedAssignment.id
          );
          await setDoc(gradeDocRef, {
            assignmentId: selectedAssignment.id,
            title: file ? file.name : "No file",
            submittedAt: new Date(),
            grade: null, // Initialize grade as null
          });
  
          setMessage("Assignment submitted successfully!");
  
          const newAssignment = {
            id: newSubmission.id,
            title: file ? file.name : "No file",
            description: description,
            submittedAt: new Date(),
            studentId: currentUser.uid,
            assignmentId: selectedAssignment.id,
            grade: null,
          };
          setStudentAssignments([...studentAssignments, newAssignment]);
  
          // Clear inputs
          setDescription("");
          setFile(null);
          setSelectedAssignment(null);
        };
  
        submitAssignment();
      });
  
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setMessage("Failed to submit the assignment. Please try again.");
    }
  };
  

  // const handleSubmitAssignment = async () => {
  //   if (!file && !description) {
  //     setMessage("Please select a file or provide a description.");
  //     return;
  //   }

  //   try {
  //     // Add the assignment submission to Firestore
  //     const newSubmission = await addDoc(
  //       collection(db, `uploads/${selectedCourse.id}/assignments`),
  //       {
  //         title: file ? file.name : "No file",
  //         description: description,
  //         submittedAt: new Date(),
  //         studentId: currentUser.uid,
  //         studentName: currentUser.displayName,
  //         assignmentId: selectedAssignment.id,
  //       }
  //     );

  //     // Add a corresponding grade entry in the grades subcollection
  //     const gradeDocRef = doc(
  //       db,
  //       `students/${currentUser.uid}/enrolledCourses/${selectedCourse.id}/grades`,
  //       selectedAssignment.id
  //     );
  //     await setDoc(gradeDocRef, {
  //       assignmentId: selectedAssignment.id,
  //       title: file ? file.name : "No file",
  //       submittedAt: new Date(),
  //       grade: null, // Initialize grade as null
  //     });

  //     setMessage("Assignment submitted successfully!");

  //     const newAssignment = {
  //       id: newSubmission.id,
  //       title: file ? file.name : "No file",
  //       description: description,
  //       submittedAt: new Date(),
  //       studentId: currentUser.uid,
  //       assignmentId: selectedAssignment.id,
  //       grade: null,
  //     };
  //     setStudentAssignments([...studentAssignments, newAssignment]);

  //     // Clear inputs
  //     setDescription("");
  //     setFile(null);
  //     setSelectedAssignment(null);
  //   } catch (error) {
  //     console.error("Error submitting assignment:", error);
  //     setMessage("Failed to submit the assignment. Please try again.");
  //   }
  // };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="assignment">
      <header className="list-header">
        <h1 className="preet">Student Dashboard</h1>
        <div className="button-list">
          <button className="btn-list">
            <Link to="/ViewProfile">Student Profile</Link>
          </button>
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <nav className="sidebar-assignment">
        <ul>
          <li><Link to="/studentdash">List of courses</Link></li>
          <li><Link to="/enrolled-courses">Enrolled Courses</Link></li>
          <li><Link to="/syllabus">Syllabus</Link></li>
          <li><Link to="/schedule">Course Schedule</Link></li>
          <li><Link to="/discussions">Discussions</Link></li>
          <li><Link to="/assignmentsandquizzes">Assignments & Quiz</Link></li>
          <li><Link to="/graded">Grades</Link></li>
          <li><Link to="/course-documents">Course Documents</Link></li>
          <li><Link to="/report">Report</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/studentnotificationsetup">Student Notification Setup</Link></li>
          <li><Link to="/duedate">Due Dates</Link></li>
        </ul>
      </nav>

      <div className="main-assignment">
        <h2>View Assignments</h2>

        {courses.length === 0 ? (
          <p>Loading courses...</p>
        ) : (
          <div className="courses-list-ass">
            <h3>Select a Course</h3>
            {courses.map((course) => (
              <div
                key={course.id}
                className={`course-card-ass ${selectedCourse?.id === course.id ? "selected" : ""}`}
                onClick={() => setSelectedCourse(course)}
              >
                <h4>{course.title}</h4>
                <p>{course.description}</p>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="assignments-list1">
            <h3>Teacher's Assignments for {selectedCourse.title}</h3>
            {teacherAssignments.length > 0 ? (
              teacherAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="assignment-card1"
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <p>Title: {assignment.title}</p>
                  <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p>No assignments posted by the teacher yet.</p>
            )}

            {selectedAssignment && (
              <div className="submit-assignment1">
                <h3>Submit Your Assignment</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write your assignment description here"
                />
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleSubmitAssignment}>Submit Assignment</button>
                {message && <p>{message}</p>}
              </div>
            )}
          </div>
        )}

        {studentAssignments.length > 0 && (
          <div className="submitted-assignments">
            <h3>Submitted Assignments</h3>
            {studentAssignments.map((assignment) => (
              <div key={assignment.id} className="assignment-card">
                <p><strong>Title:</strong> {assignment.title}</p>
                <p><strong>Description:</strong> {assignment.description}</p>
                <p><strong>Submitted At:</strong> {new Date(assignment.submittedAt).toLocaleString()}</p>
                <p><strong>Grade:</strong> {assignment.grade !== null ? assignment.grade : "Not graded yet"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer-assignment">
        <a href="#" className="footer-link">About Us</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Contact Us</a>
      </footer>
    </div>
  );
};

export default Assignmentsandquizzes;
