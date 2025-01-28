import React from "react";
import { useNavigate } from "react-router-dom";
// import "./Notification.css";
import Sidebar from "./Sidebar";
import Footer from "../Footer";

const Notification = () => {
  const navigate = useNavigate();

  const handleViewClick = (notificationType) => {
    switch (notificationType) {
      case "New Grade":
        navigate("/grades");
        break;
      case "New Course":
        navigate("/enrolled-courses");
        break;
      case "New Course Documents":
        navigate("/upload-documents");
        break;
      default:
        alert(`No page configured for: ${notificationType}`);
    }
  };

  // Function to handle Student Profile navigation
  const handleProfileClick = () => {
    navigate("/StudentProfile"); // Update the route if the profile page has a different name
  };

  // Function to handle Sign Out (Clear session and navigate to login)
  const handleSignOut = () => {
    // Clear authentication data (if you're using localStorage or sessionStorage)
    localStorage.removeItem("authToken"); // Example: Remove the auth token from localStorage
    sessionStorage.removeItem("authToken"); // Optional, if you're using sessionStorage
    
    // Redirect to login page
    navigate("/student"); // Update the route if the login page has a different name
  };

  return (
    <div className="notification11-container">
      {/* <header className="header12">
        <div className="logic">LMS</div>
        <div className="headerss-options">
          <button
            className="profiless-button"
            onClick={handleProfileClick}
            style={{ zIndex: 10 }}
          >
            Student Profile
          </button>
          <button
            className="signoutss-button"
            onClick={handleSignOut}
            style={{ zIndex: 10 }}
          >
            Sign out
          </button>
        </div>
      </header> */}

      <Sidebar />

      <main className="contentss">
        <h2 className="notificationsstitle">Notification</h2>
        <div className="notificationsstable">
          <table>
            <thead>
              <tr>
                <th>New Assignment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>New Grade</td>
                <td>
                  <button
                    className="viewssbutton"
                    onClick={() => handleViewClick("New Grade")}
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td>New Course</td>
                <td>
                  <button
                    className="viewssbutton"
                    onClick={() => handleViewClick("New Course")}
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td>New Course Documents</td>
                <td>
                  <button
                    className="viewssbutton"
                    onClick={() => handleViewClick("New Course Documents")}
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notification;
