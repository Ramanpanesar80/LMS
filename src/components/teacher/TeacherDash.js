import React from "react";
import { Link } from "react-router-dom";

const TeaacherDash = () => {
    return (
        <div className="studentdash">
            <nav className="navbar">
                <h2>Teacher Dashboard</h2>
                <ul>
                    <li>
                        <Link to="/educator/courses">Courses</Link>
                    </li>
                    <li>
                        <Link to="/educator/assignments">Assignments</Link>
                    </li>
                    <li>
                        <Link to="/educator/discussions">Discussions</Link>
                    </li>
                </ul>
            </nav>
            <main className="content">
                <h1>Welcome to the Teacher Dashboard!</h1>
                <p>Select an option from the navigation bar to proceed.</p>
            </main>
        </div>
    );
};

export default TeaacherDash;