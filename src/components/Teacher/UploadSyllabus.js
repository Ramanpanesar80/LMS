import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Ensure Firebase is configured properly
import { collection, updateDoc, doc, onSnapshot, setDoc } from "firebase/firestore";

const Syllabus = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [syllabusData, setSyllabusData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch courses
    const unsubscribeCourses = onSnapshot(
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

    // Fetch syllabus data
    const unsubscribeSyllabus = onSnapshot(
      collection(db, "syllabus"),  // Syllabus collection
      (snapshot) => {
        const syllabusData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSyllabusData(syllabusData);
      },
      (err) => {
        console.error("Error fetching syllabus data:", err);
        setError("Failed to load syllabus data. Please try again later.");
      }
    );

    return () => {
      unsubscribeCourses();
      unsubscribeSyllabus();
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedFile({
        name: file.name,
        content: e.target.result, // Base64-encoded file content
      });
    };

    reader.readAsDataURL(file); // Read file as Base64
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (selectedFile && selectedCourse !== null) {
      try {
        const course = selectedCourse;

        setUploading(true);

        // Create a new document or update syllabus in Firestore
        const syllabusDocRef = doc(db, "syllabus", course.id);  // Using course.id as the identifier for syllabus

        await setDoc(syllabusDocRef, {
          file: selectedFile.name,
          fileContent: selectedFile.content,
          courseId: course.id,
          courseName: course.title,
        });

        setMessage(`Syllabus file "${selectedFile.name}" uploaded successfully!`);
        setSelectedFile(null);
        setIsModalOpen(false);
        setUploading(false);
      } catch (error) {
        console.error("Error uploading file:", error);
        setError("Failed to upload file. Please try again.");
        setUploading(false);
      }
    } else {
      setError("Please select a file and a course.");
    }
  };

  return (
    <div className="syllabus-container">
      <header className="header">
        <h2>Manage Syllabus</h2>
      </header>

      <main className="main-content">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="courses-list">
            <table className="syllabus-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Syllabus</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const syllabus = syllabusData.find((s) => s.courseId === course.id);
                  return (
                    <tr key={course.id}>
                      <td>{course.title}</td>
                      <td>
                        {syllabus?.file ? (
                          <>
                            {syllabus.file}{" "}
                            <a href={syllabus.fileContent} download={syllabus.file}>
                              Download
                            </a>
                          </>
                        ) : (
                          "No file uploaded"
                        )}
                      </td>
                      <td>
                        <button
                          className="btn"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsModalOpen(true);
                          }}
                        >
                          Upload Syllabus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Upload Syllabus for {selectedCourse?.title}</h3>
            <form className="upload-form" onSubmit={handleUpload}>
              <label htmlFor="syllabus-file">Choose File:</label>
              <input type="file" id="syllabus-file" onChange={handleFileChange} />
              {selectedFile && <p>Selected File: {selectedFile.name}</p>}
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
              <div className="modal-actions">
                <button type="submit" className="btn" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>About | Privacy Policy | Terms and Conditions | Contact Us</p>
      </footer>
    </div>
  );
};

export default Syllabus;
