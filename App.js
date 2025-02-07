import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AdminLogin from "./components/AdminLogin";
import Homepage from "./components/Home";
import StudentLogin from "./components/StudentLogin";
import TeacherLogin from "./components/TeacherLogin";
import ForgotPassword from "./ForgotPassword";
import SignUp from "./components/SignUp";
import StudentDash from "./components/Student/StudentDash";
import EnrolledCourses from "./components/Student/EnrolledCourses";
import StudentProfile from "./components/Student/StudentProfile";
import CreateCourses from "./components/Teacher/CreateCourses";
import AdminDashboard from "./components/Admin/AdminDash";
import ViewCourses from "./components/Teacher/VierCourses";
import UploadSyllabus from "./components/Teacher/UploadSyllabus";
import UploadSchedule from "./components/Teacher/UploadSchedule" 
import CourseSchedule from "./components/Student/CourseSchedule";
import Syllabus from "./components/Student/Syllabus";
import StudentDetails from "./components/Student/StudentDetails";
import UploadCourse from "./components/Teacher/UploadCourse";
import Duedate from "./components/Student/Duedate";
import Assignmentsandquizzes from "./components/Student/assignmentandquizzes";
import Notifications from "./components/Student/Notification";
import Assignments from "./components/Teacher/Assignments";
import Grades from "./components/Teacher/Grades";
import Graded from "./components/Student/Graded";
import Postquestion from "./components/Teacher/Postquestion";
import Viewsubmitassignments from "./components/Teacher/Viewsubmitassignment";
import SuspendStudent from "./components/Admin/SuspendStudent";
import Removeposts from "./components/Admin/Removeposts";
import ManageUsers from "./components/Admin/ManageUsers";
import Adminview from "./components/Admin/Admincontentview";
import ProtectedRoute from "./components/ProtectedRoute";
import ViewProfile from "./components/Student/ViewProfile";
import TeacherProfile from "./components/Teacher/TeacherProfile";
import Flagged  from './components/Admin/flagged';
import Admincontrol  from './components/Admin/Admincontrol';
import Adminpermission from './components/Admin/Adminpermisson';
import Studentdiscussion from "./components/Student/Studentdiscussion";
import Signout from "./components/Student/Signout";
import NextPage from "./components/Student/nextpage";
import AdminManageSettings from "./components/Admin/platformsettings";
import Adminprofile from "./components/Admin/Studentprofileset";


import "./App.css";
import TeacherAttendance from "./components/Teacher/TeacherAttendance";
function App() {
  const [userId, setUserId] = useState(null);

  // Monitor user authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        console.log("No user is logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/educator" element={<TeacherLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />


        {/* Protected Routes */}
        <Route
          path="/studentdash"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDash />
            </ProtectedRoute>
          }
        />
           <Route
          path="/permission"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Adminpermission />
            </ProtectedRoute>
          }
        />

<Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Adminprofile />
            </ProtectedRoute>
          }
        />

<Route
          path="/platform"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminManageSettings />
            </ProtectedRoute>
          }
        />
           <Route
          path="/nextpage"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <NextPage />
            </ProtectedRoute>
          }
        />
       
        <Route
        path="/ViewProfile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ViewProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-course"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <CreateCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <Grades />
            </ProtectedRoute>
          }
        />
         <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAttendance />
            </ProtectedRoute>
          }
        />
         <Route
          path="/flagged"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Flagged />
            </ProtectedRoute>
          }
        />
          <Route
          path="/control"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Admincontrol />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacherprofile"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
          

        <Route
          path="/view-course"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <ViewCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Student-discussion"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Studentdiscussion />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/Sign-out"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Signout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/graded"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Graded />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/enrolled-courses"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <EnrolledCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/StudentProfile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/syllabus"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher"]}>
              <Syllabus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-syllabus"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <UploadSyllabus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <CourseSchedule userId={userId} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-schedule"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <UploadSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-documents"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-documents"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <UploadCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/duedate"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Duedate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignmentsandquizzes"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Assignmentsandquizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postquestion"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <Postquestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewsubmitassignments"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <Viewsubmitassignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suspendstudent"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SuspendStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/removeposts"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Removeposts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
          <Route
          path="/Admin-view"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Adminview />
            </ProtectedRoute>
          }
        /> 
      </Routes>
    </Router>
  );
}

export default App;
