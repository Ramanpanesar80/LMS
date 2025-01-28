import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const CourseSchedule = ({ userId }) => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [scheduleFiles, setScheduleFiles] = useState([]);

  // Guard clause: Only run the effect if userId is defined
  useEffect(() => {
    if (!userId) {
      console.error("User ID is not defined!");
      return; // Don't fetch schedules if userId is not available
    }

    const fetchScheduleFiles = async () => {
      try {
        // Query Firestore for course schedules matching the selected year
        const q = query(
          collection(db, "courseSchedules"),
          where("year", "==", selectedYear)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // If schedules are found, map them to an array of data
          const fileList = querySnapshot.docs.map((doc) => doc.data());
          console.log("Fetched schedules:", fileList);
          setScheduleFiles(fileList); // Store the list of file metadata
        } else {
          console.log("No schedules found for this year.");
          setScheduleFiles([]); // Set an empty array if no schedules are found
        }
      } catch (error) {
        console.error("Error fetching schedule files: ", error);
      }
    };

    fetchScheduleFiles(); // Call function to fetch schedules
  }, [selectedYear, userId]); // Re-run the effect if userId or selectedYear changes

  // Handle year change
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Guard clause: If userId is not defined, show an error message
  if (!userId) {
    return <p>User not logged in</p>;
  }

  return (
    <div className="container">
      {/* <header className="header">
        <h1>Welcome Student!</h1>
      </header> */}

      <div className="content">
        <div className="year-selector">
          <label htmlFor="year">Select Year: </label>
          <select id="year" value={selectedYear} onChange={handleYearChange}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        <h2>Course Schedule for {selectedYear}</h2>
        {scheduleFiles.length > 0 ? (
          <div className="schedule-table">
            <table>
              <thead>
                <tr>
                  <th>Schedule</th>
                  <th>Action</th> {/* Add an Action column for the download button */}
                </tr>
              </thead>
              <tbody>
                {scheduleFiles.map((file) => (
                  <tr key={file.fileName}>
                    <td>{file.fileName}</td>
                    <td>
                      {file.fileContent ? (
                        <a href={file.fileContent} download={file.fileName}>
                          <button className="btn">Download</button>
                        </a>
                      ) : (
                        "No download available"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No schedules available for {selectedYear}.</p>
        )}
      </div>
    </div>
  );
};

export default CourseSchedule;
