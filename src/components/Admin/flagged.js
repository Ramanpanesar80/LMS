import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

const FlaggedContentAdmin = () => {
  // State for managing flagged questions, error messages, and loading status
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch flagged questions from Firestore when the component mounts
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reportedQuestions"), // Listening to the 'reportedQuestions' collection in Firestore
      (snapshot) => {
        // Map over the snapshot and create an array of flagged questions with their data
        setFlaggedQuestions(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (err) => {
        // Handle any errors that occur during fetching
        console.error("Error fetching flagged content:", err);
        setError("Failed to load flagged content.");
      }
    );

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Handle deleting a flagged question from both the reportedQuestions and questions collection
  const handleDeleteQuestion = async (id) => {
    setIsLoading(true); // Set loading state to true to disable the delete button
    try {
      // Delete from the 'reportedQuestions' collection
      const reportedQuestionRef = doc(db, "reportedQuestions", id);
      await deleteDoc(reportedQuestionRef);

      // Also delete from the 'questions' collection
      const questionRef = doc(db, "questions", id);
      await deleteDoc(questionRef);

      alert("Question deleted successfully.");
    } catch (err) {
      // If there is an error deleting, log it and set the error state
      console.error("Error deleting question:", err);
      setError("Failed to delete question.");
    } finally {
      // Reset loading state after the operation
      setIsLoading(false);
    }
  };

  return (
    <div className="flagged-content-admin">
      <h2>Flagged Content Management</h2>

      {/* Display error message if there is an error */}
      {error && <p className="error">{error}</p>}

      {/* Display a message if there are no flagged questions */}
      {flaggedQuestions.length === 0 ? (
        <p>No flagged content available.</p>
      ) : (
        <div className="flagged-questions-list">
          {/* Loop through the flagged questions and display each one */}
          {flaggedQuestions.map((item) => (
            <div key={item.id} className="flagged-item">
              <p>
                <strong>Question:</strong> {item.questionContent}
              </p>
              <p>
                <strong>Reported by:</strong> {item.reportedBy}
              </p>
              <p>
                <strong>Reported at:</strong> {new Date(
                  item.reportedAt.seconds * 1000 // Convert Firestore timestamp to Date object
                ).toLocaleString()}
              </p>

              <div className="actions">
                {/* Delete button, disabled during loading */}
                <button
                  onClick={() => handleDeleteQuestion(item.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Delete Question"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlaggedContentAdmin;
