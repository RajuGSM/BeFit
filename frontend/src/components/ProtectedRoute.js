import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  // If no token, redirect to the signin page
  if (!token) {
    return <Navigate to="/signin" />;
  }

  // If token exists, render the child component
  return children;
};

export default ProtectedRoute;
