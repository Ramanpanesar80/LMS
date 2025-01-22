import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; 
import { useNavigate} from "react-router-dom";
import Sidebar from "./Sidebar1"; 
 
import Footer from "../Footer"; 

import "./UploadSchedule.css";


const UploadSchedule = ({ setUploadedFileInSchedule }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]); 
 const navigate = useNavigate();
  useEffect(() => {
    const fetchFiles = async () => {
      const querySnapshot = await getDocs(collection(db, "courseSchedules"));
      const fileList = querySnapshot.docs.map((doc) => doc.data());
      setFiles(fileList);
    };

    fetchFiles();
  }, []); 
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

      
      const reader = new FileReader();
      reader.readAsDataURL(uploadedFile); 

      reader.onloadend = async () => {
        const base64File = reader.result;

        
        const fileData = {
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          fileType: uploadedFile.type,
          year: selectedYear,
          userId: "teacherId", 
          fileContent: base64File, 
        };

      
        await setDoc(doc(db, "courseSchedules", uploadedFile.name), fileData);

      
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
    setSelectedYear(""); 
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
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
    <div className="tt">
       <header className="head">
         <h1>Educator Dashboard</h1>
         <div className="header-right1">
           <button className="header2" onClick={handleSignOut}>
             Sign out
         </button>
        </div>
      </header> 
 <Sidebar/>
      <div className="ss">
        <div className="year-s">
          <label htmlFor="yearSelect2">Select Year:</label>
          <select id="yearSelect2" value={selectedYear} onChange={handleYearChange}>
            <option value="">-- Select Year --</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <button onClick={() => setIsModalVisible(true)} className="btn-uploadc">
          Upload File
        </button>

        {isModalVisible && (
          <div className="modal1">
            <div className="modalm2">
              <h2 className="b">Upload Schedule</h2>
              <label htmlFor="fileUpload1">Upload File:</label>
              <input type="file" id="fileUpload1" onChange={handleFileUpload} />
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

        <h2 className="w">Uploaded Schedules</h2>
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
                 <button className="x">  <a
                      href={file.fileContent}
                      download={file.fileName}
                    >
                      Download
                    </a></button> 
                  ) : (
                    "No file uploaded"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer/>
    </div>
  );
};

export default UploadSchedule;
