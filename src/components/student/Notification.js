import React from "react";
import { useNavigate } from "react-router-dom";
import "./Notification.css";
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

  return (
    <div className="notification-container">
      <header className="header">
        <div className="logo">LMS</div>
        <div className="header-options">
          <button className="profile-button">Student Profile</button>
          <button className="signout-button">Sign out</button>
        </div>
      </header>

      <Sidebar />


      <main className="content">
        <h2 className="notification-title">Notification</h2>
        <div className="notification-table">
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
                    className="view-button"
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
                    className="view-button"
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
                    className="view-button"
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
      <Footer/>
    </div>
  );
};

export default Notification;
