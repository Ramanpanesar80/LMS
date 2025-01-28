import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProtectedRoute = ({ children, role }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/" />;
  }


  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
