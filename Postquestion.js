import React, { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, getDoc } from "firebase/firestore"; 
import { db } from "../../firebase"; 
import { useNavigate } from "react-router-dom"; 
import "./Postquestion.css";

const TeacherPostQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [question, setQuestion] = useState(""); 
  const [comments, setComments] = useState(""); 
  const [questions, setQuestions] = useState([]); 
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

  // Fetch questions and comments for the selected course
  useEffect(() => {
    if (selectedCourse) {
      const unsubscribe = onSnapshot(
        collection(db, `courses/${selectedCourse.id}/questions`),
        (snapshot) => {
          const questionsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuestions(questionsData);
        },
        (err) => {
          console.error("Error fetching questions:", err);
          setError("Failed to load questions. Please try again later.");
        }
      );

      return () => unsubscribe();
    }
  }, [selectedCourse]);

  // Handle question submission
  const handlePostQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    try {
      await addDoc(collection(db, `courses/${selectedCourse.id}/questions`), {
        question: question,
        comments: [],
        postedAt: new Date(),
      });
      setQuestion(""); // Reset input field
      alert("Question posted successfully!");
    } catch (err) {
      console.error("Error posting question:", err);
      setError("Failed to post question. Please try again later.");
    }
  };

  // Handle comment submission
  const handlePostComment = async (questionId) => {
    if (!comments.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      const questionRef = doc(db, `courses/${selectedCourse.id}/questions`, questionId);
      const questionDoc = await getDoc(questionRef); // Make sure to use getDoc here

      if (questionDoc.exists()) {
        const currentComments = questionDoc.data().comments || [];
        await updateDoc(questionRef, {
          comments: [...currentComments, { comment: comments, postedAt: new Date() }],
        });
        setComments(""); // Reset input field
        alert("Comment posted successfully!");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment. Please try again later.");
    }
  };

  return (
    <div className="post-questions-container">
      <div className="sidebar">
        <ul>
          <li>
            <button onClick={() => navigate("/teacherdash")}>Dashboard</button>
          </li>
          <li>
            <button onClick={() => navigate("/post-teacher-questions")}>Post Questions</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <h2>Teacher - Post Questions and Comments</h2>

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
          <div className="question-form">
            <h3>Post a New Question</h3>
            <textarea
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={handlePostQuestion}>Post Question</button>

            <h3>Questions in {selectedCourse.title}</h3>
            {questions.length > 0 ? (
              questions.map((questionItem) => (
                <div key={questionItem.id} className="question-card">
                  <p>{questionItem.question}</p>
                  <p>Posted on: {new Date(questionItem.postedAt.toDate()).toLocaleString()}</p>

                  <h4>Comments</h4>
                  {questionItem.comments.length > 0 ? (
                    questionItem.comments.map((comment, index) => (
                      <div key={index} className="comment">
                        <p>{comment.comment}</p>
                        <p>Posted on: {new Date(comment.postedAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}

                  <div className="comment-form">
                    <textarea
                      placeholder="Add a comment..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                    <button onClick={() => handlePostComment(questionItem.id)}>Post Comment</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No questions posted yet for this course.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPostQuestions;
