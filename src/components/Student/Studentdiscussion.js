import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";

const Studentdiscussion = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [question, setQuestion] = useState("");
  const [comments, setComments] = useState({});
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("Loading..."); // Default value set to "Loading..."
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();

  // Fetch student's details and courses
  useEffect(() => {
    const fetchStudentName = async () => {
      try {
        const user = auth.currentUser;
        console.log("Authenticated User:", user); // Check if the user is authenticated

        if (user) {
          const docRef = doc(db, "students", user.uid); // Reference to the student's document
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Student Data:", data); // Check the data returned from Firestore
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

    // Fetch courses
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

  // Fetch questions for the selected course
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

  // Handle posting a new question
  const handlePostQuestion = useCallback(async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, `courses/${selectedCourse.id}/questions`), {
        question,
        studentName, // Use studentName here
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
  }, [question, selectedCourse, studentName]); // Updated to use studentName

  // Handle posting a comment
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
              { comment: comments[questionId], userId: studentName, postedAt: new Date() }, // Updated to use studentName
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
    [comments, selectedCourse, studentName] // Updated to use studentName
  );

  // Handle reporting a post
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
              { reportedBy: studentName, reportedAt: new Date() }, // Updated to use studentName
            ],
          });

          await addDoc(collection(db, "reportedQuestions"), {
            questionId,
            courseId: selectedCourse.id,
            reportedBy: studentName, // Updated to use studentName
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
    [selectedCourse, studentName] // Updated to use studentName
  );

  // Handle comment input change
  const handleCommentChange = (questionId, value) => {
    setComments((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className="post-questions-container">
      <div className="main-content">
        <h2>Student - Post Questions</h2>
        <p>Welcome, {studentName}</p> {/* Display student name */}

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

        {selectedCourse && (
          <div className="question-form">
            <textarea
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={handlePostQuestion} disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Question"}
            </button>
            {error && <p className="error">{error}</p>}

            <h3>Questions in {selectedCourse.title}</h3>
            
             {questions.map((questionItem) => (
              <div key={questionItem.id} className="question-item">
                <p>
                  <strong>Question:</strong> {questionItem.question}
                </p>
                <p>
                  <strong>Posted by:</strong> {questionItem.studentName || "Unknown"}
                </p>

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
                  className="report-button"
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
    </div>
  );
};

export default Studentdiscussion;
