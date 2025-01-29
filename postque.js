import React, { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, getDoc,} from "firebase/firestore";
import { db } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./Postquestion.css";

const TeacherPostQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [question, setQuestion] = useState("");
  const [comments, setComments] = useState({});
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  
  const navigate = useNavigate();


  const auth = getAuth();


  useEffect(() => {
    const fetchTeacherName = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "teacher", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setTeacherName(data.name || "Unknown");
          } else {
            console.error("No document found for UID:", user.uid);
            setTeacherName("Unknown");
          }
        } else {
          console.error("No authenticated user found.");
        }
      } catch (error) {
        console.error("Error fetching teacher name:", error);
        setTeacherName("Error fetching name");
      }
    };

    fetchTeacherName();

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
        teacherName,
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
  }, [question, selectedCourse, teacherName]);

 
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
              { comment: comments[questionId], userId: teacherName, postedAt: new Date() },
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
    [comments, selectedCourse, teacherName]
  );

  
  const handleReportPost = useCallback(
    async (questionId) => {
      setIsLoading(true);
      try {
        const questionRef = doc(db, `courses/${selectedCourse.id}/questions`, questionId);
        const questionDoc = await getDoc(questionRef);

        if (questionDoc.exists()) {
          const currentReports = questionDoc.data().reports || [];
          await updateDoc(questionRef, {
            reports: [
              ...currentReports,
              { reportedBy: teacherName, reportedAt: new Date() },
            ],
          });

          await addDoc(collection(db, "reportedQuestions"), {
            questionId,
            courseId: selectedCourse.id,
            reportedBy: teacherName,
            reportedAt: new Date(),
            questionContent: questionDoc.data().question,
          });

          alert("Post reported successfully!");
        }
      } catch (err) {
        console.error("Error reporting post:", err);
        setError("Failed to report the post.");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCourse, teacherName]
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
      }
    };

  return (
    <div className="post-questions-container">
         {/* <header className="list-header">
        <h1 className="preet">Teacher Dashboard</h1>
        <div className="button-list">
          <button className="btn-list">
            <Link to="/ViewProfile">Teacher Profile</Link>
          </button>
          <button className="list-logout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="sidebar-post">
           <ul>
             <li><Link to="/create-course">Create Courses</Link></li>
             <li><Link to="/assignments">Post Assignment</Link></li>
             <li><Link to="/viewsubmitassignments">View Submitted Assignments</Link></li>
             <li><Link to="/postquestion">Discussion</Link></li>
            <li><Link to="/attendance">Attendance</Link></li>
             <li><Link to="/view-course">View Course</Link></li>
             <li><Link to="/upload-syllabus">Upload Syllabus</Link></li>
             <li><Link to="/upload-schedule">Upload Schedule</Link></li>
             <li><Link to="/upload-documents">course documents</Link></li>
             
   
           </ul>
         </div> */}
      <div className="main-content-post">
        <h2 className="posth2">Teacher - Post Questions</h2>
        <p>Welcome, {teacherName}</p>

        <div className="courses-list-post1">
          <h3>Select a Course</h3>
          {courses.map((course) => (
            <div
              key={course.id}
              className={`course-card-post ${selectedCourse?.id === course.id ? "selected" : ""}`}
              onClick={() => setSelectedCourse(course)}
            >
              <h4>{course.title}</h4>
              <p>{course.description}</p>
            </div>
          ))}
        </div>

        {selectedCourse && (
          <div className="question-form-post">
            <textarea
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={handlePostQuestion} disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Question"}
            </button>
            {error && <p className="error-post">{error}</p>}

            <h3 className="posth1">Questions in {selectedCourse.title}</h3>
            {questions.map((questionItem) => (
              <div key={questionItem.id} className="question-card-post">
                <p><strong>Question:</strong> {questionItem.question}</p>
                <p><strong>Posted by:</strong> {questionItem.teacherName || "Unknown"}</p>
                <h4>Comments</h4>
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
                <button
                  onClick={() => handlePostComment(questionItem.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Posting..." : "Post Comment"}
                </button>
                <button
                  className="report-button-post"
                  onClick={() => handleReportPost(questionItem.id)}
                  disabled={isLoading}
                >
                  Report Post
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="footer-create">
        <a href="#" className="footer-link">About Us</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Contact Us</a>
      </footer>
    </div>
  );
};

export default TeacherPostQuestions;
