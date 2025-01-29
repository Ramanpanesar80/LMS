import React, { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "./Studentdiscussion.css";

const Studentdiscussion = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [question, setQuestion] = useState("");
  const [comments, setComments] = useState({});
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    const fetchStudentName = async () => {
      try {
        const user = auth.currentUser;
        console.log("Authenticated User:", user);

        if (user) {
          const docRef = doc(db, "students", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Student Data:", data);
            setStudentName(data.name || "Unknown");
          } else {
            console.error("No document found for UID:", user.uid);
            setStudentName("Unknown");
          }
        } else {
          console.error("No authenticated user found.");
          setStudentName("User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching student name:", error);
        setStudentName("Error fetching name");
      }
    };

    fetchStudentName();

    const unsubscribe = onSnapshot(
      collection(db, "courses"),
      (snapshot) => {
        setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (err) => {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses.");
      }
    );

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (selectedCourse) {
      const unsubscribe = onSnapshot(
        collection(db, `courses/${selectedCourse.id}/questions`),
        (snapshot) => {
          setQuestions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (err) => {
          console.error("Error fetching questions:", err);
          setError("Failed to load questions.");
        }
      );

      return () => unsubscribe();
    }
  }, [selectedCourse]);

  const handlePostQuestion = useCallback(async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, `courses/${selectedCourse.id}/questions`), {
        question,
        studentName,
        comments: [],
        reports: [],
        postedAt: new Date(),
      });
      setQuestion("");
      alert("Question posted successfully!");
    } catch (err) {
      console.error("Error posting question:", err);
      setError("Failed to post question.");
    } finally {
      setIsLoading(false);
    }
  }, [question, selectedCourse, studentName]);

  const handlePostComment = useCallback(
    async (questionId) => {
      if (!comments[questionId]?.trim()) {
        setError("Please enter a comment.");
        return;
      }

      setIsLoading(true);
      try {
        const questionRef = doc(db, `courses/${selectedCourse.id}/questions`, questionId);
        const questionDoc = await getDoc(questionRef);

        if (questionDoc.exists()) {
          const currentComments = questionDoc.data().comments || [];
          await updateDoc(questionRef, {
            comments: [
              ...currentComments,
              { comment: comments[questionId], userId: studentName, postedAt: new Date() },
            ],
          });
          setComments((prev) => ({ ...prev, [questionId]: "" }));
          alert("Comment posted successfully!");
        }
      } catch (err) {
        console.error("Error posting comment:", err);
        setError("Failed to post comment.");
      } finally {
        setIsLoading(false);
      }
    },
    [comments, selectedCourse, studentName]
  );

  const handleCommentChange = (questionId, value) => {
    setComments((prev) => ({ ...prev, [questionId]: value }));
  };

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
    <div className="post-questions-container">
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
     
        <nav className="sidebar-d">
          <ul>
            <li><Link to="/studentdash">List of courses</Link></li>
            <li><Link to="/enrolled-courses">Enrolled Courses</Link></li>
            <li><Link to="/syllabus">Syllabus</Link></li>
            <li><Link to="/schedule">Course Schedule</Link></li>
            <li><Link to="/Student-discussion">Discussions</Link></li>
            <li><Link to="/assignmentsandquizzes">Assignments & Quiz</Link></li>
            <li><Link to="/graded">Grades</Link></li>
            <li><Link to="/course-documents">Course Documents</Link></li>
            <li><Link to="/attendance">Attendance</Link></li>
            <li><Link to="/notifications">Notifications</Link></li>
          </ul>
        </nav>
        <div className="main-discussion">
       <h2 className="oo">Student - Post Questions</h2>
        <p>Welcome, {studentName}</p>

        <div className="courses-discussion">
          <h3>Select a Course</h3>
          {courses.map((course) => (
            <div
              key={course.id}
              className={`course-card-discussion ${selectedCourse?.id === course.id ? "selected" : ""}`}
              onClick={() => setSelectedCourse(course)}
            >
              <h4>{course.title}</h4>
              <p>{course.description}</p>
            </div>
          ))}
        </div>

        {selectedCourse && (
          <div className="question-discussion">
            <textarea
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={handlePostQuestion} disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Question"}
            </button>
            {error && <p className="error">{error}</p>}

            <h3 className="discussionh"> Questions in {selectedCourse.title}</h3>
            
            {questions.map((questionItem) => (
              <div key={questionItem.id} className="question-item-discussion">
                <p>
                  <strong>Question:</strong> {questionItem.question}
                </p>
                <p>
                  <strong>Posted by:</strong> {questionItem.studentName || "Unknown"}
                </p>

                <h4 className="discussionj">Comments</h4>
                {questionItem.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <p>{comment.comment}</p>
                    <small>Posted by: {comment.userId}</small>
                  </div>
                ))}
                <textarea
                  placeholder="Write your comment..."
                  value={comments[questionItem.id] || ""}
                  onChange={(e) => handleCommentChange(questionItem.id, e.target.value)}
                />
                <button className="discussion-btn"
                  onClick={() => handlePostComment(questionItem.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Posting..." : "Post Comment"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="footer-mass">
      <a href="#" className="footer-link-mass">About Us</a>
      <a href="#" className="footer-link-mass">Privacy Policy</a>
      <a href="#" className="footer-link-mass">Terms and Conditions</a>
      <a href="#" className="footer-link-mass">Contact Us</a>
    </footer>
    </div>
  );
};

export default Studentdiscussion;
