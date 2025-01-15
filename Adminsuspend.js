import React, { useState } from "react";
import "./Adminsuspend.css";

const Adminsuspend = () => {
  
  const [suspendedStudents, setSuspendedStudents] = useState([
    { id: 1, email: "student1@university.com" },
    { id: 2, email: "student2@university.com" },
    { id: 3, email: "student3@university.com" },
  ]);

  const [events, setEvents] = useState([
    { id: 1, name: "Book Donation Drive" },
    { id: 2, name: "Author Meet and Greet" },
    { id: 3, name: "Library Orientation" },
  ]);

  const handleReactivateStudent = (id) => {
    setSuspendedStudents(suspendedStudents.filter((student) => student.id !== id));
    console.log("Reactivated student with ID:", id);
  };

  const handleDeleteStudent = (id) => {
    setSuspendedStudents(suspendedStudents.filter((student) => student.id !== id));
    console.log("Deleted student with ID:", id);
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
    console.log("Deleted event with ID:", id);
  };

  return (
    <div className="admin-library">
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-logo">Library Admin</a>
          <ul className="navbar-menu">
            <li><a href="/">Dashboard</a></li>
            <li><a href="/" className="active">Manage Students</a></li>
            <li><a href="/">Manage Events</a></li>
            <li><a href="/">Reports</a></li>
          </ul>
          <div className="navbar-actions">
            <a href="/profile" className="navbar-profile">Profile</a>
            <button className="btn-logout">Log Out</button>
          </div>
        </div>
      </nav>

      <div className="content">
        <div className="table-container">
          <h3>Suspended Students</h3>
          <table>
            <thead>
              <tr>
                <th>Student Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {suspendedStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.email}</td>
                  <td>
                    <button
                      onClick={() => handleReactivateStudent(student.id)}
                      className="btn-reactivate"
                    >
                      Reactivate
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <h3>Library Events</h3>
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer>
        <p>About | Privacy Policy | Terms and Conditions | Contact Us</p>
      </footer>
    </div>
  );
};

export default Adminsuspend;
