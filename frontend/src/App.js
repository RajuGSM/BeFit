import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./pages/NavBar";
import Dashboard from "./pages/dashboard";
import LogFood from "./pages/nutrition";
import LogWorkouts from "./pages/workouts";
import Login from "./pages/signin";
import Signup from "./pages/signup";
import ChatBot from "./pages/chatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/home";
const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};
const AppRoutes = () => {
  const location = useLocation(); // Works as long as <Router> wraps this component

  return (
    <>
      {location.pathname !== "/" && location.pathname !== "/signin" && location.pathname !== "/signup" && <Navbar />}
      <div className="mt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logfood"
            element={
              <ProtectedRoute>
                <LogFood />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatBot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logworkouts"
            element={
              <ProtectedRoute>
                <LogWorkouts />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};
export default App;

