import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Firestore import
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
// import "./UploadSchedule.css";

const UploadSchedule = ({ setUploadedFileInSchedule }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]); // To display uploaded files

  // Fetch uploaded files from Firestore
  useEffect(() => {
    const fetchFiles = async () => {
      const querySnapshot = await getDocs(collection(db, "courseSchedules"));
      const fileList = querySnapshot.docs.map((doc) => doc.data());
      setFiles(fileList);
    };

    fetchFiles();
  }, []); // The effect runs once when the component mounts

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile || !selectedYear) {
      alert("Please select a file and a year.");
      return;
    }

    try {
      setLoading(true);

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(uploadedFile); // Convert the file to base64 string

      reader.onloadend = async () => {
        const base64File = reader.result;

        // Prepare metadata to save in Firestore
        const fileData = {
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          fileType: uploadedFile.type,
          year: selectedYear,
          userId: "teacherId", // Replace with dynamic user ID if needed
          fileContent: base64File, // Store the base64 string here
        };

        // Save metadata to Firestore
        await setDoc(doc(db, "courseSchedules", uploadedFile.name), fileData);

        // After Firestore save is successful
        alert(`${uploadedFile.name} metadata saved successfully!`);
        setUploadedFileInSchedule(fileData);
        setFiles((prevFiles) => [...prevFiles, fileData]);
        closeModal();
      };
    } catch (error) {
      console.error("Error saving file metadata:", error);
      alert("Error saving file metadata. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setUploadedFile(null);
    setSelectedYear(""); // Reset year selection
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Upload Course Schedule</h1>
      </header>

      <div className="main-content">
        <div className="year-selection">
          <label htmlFor="yearSelect">Select Year:</label>
          <select id="yearSelect" value={selectedYear} onChange={handleYearChange}>
            <option value="">-- Select Year --</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <button onClick={() => setIsModalVisible(true)} className="btn-upload">
          Upload File
        </button>

        {isModalVisible && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Upload Schedule</h2>
              <label htmlFor="fileUpload">Upload File:</label>
              <input type="file" id="fileUpload" onChange={handleFileUpload} />
              {uploadedFile && <p>Selected File: {uploadedFile.name}</p>}
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !uploadedFile || !selectedYear}
                >
                  {loading ? "Saving..." : "Submit"}
                </button>
                <button onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <h2>Uploaded Schedules</h2>
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Year</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.fileName}>
                <td>{file.fileName}</td>
                <td>{file.year}</td>
                <td>
                  {file.fileContent ? (
                    <a
                      href={file.fileContent}
                      download={file.fileName}
                    >
                      Download
                    </a>
                  ) : (
                    "No file uploaded"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadSchedule;