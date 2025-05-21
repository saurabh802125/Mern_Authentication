import React, { useContext, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Entries from "./pages/Entries";
import AnalyticsPage from "./pages/AnalyticsPage";
import Dashboard from "./components/Dashboard";
import Profile from "./pages/Profile";
import AppNavbar from "./components/AppNavbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main";
import OtpVerification from "./pages/OtpVerification";

// Private route component to protect routes requiring authentication
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(Context);
  
  // If not authenticated, redirect to auth page
  if (isAuthenticated === false) {
    return <Navigate to="/auth" />;
  }
  
  // If authentication is still loading (undefined), show loading
  if (isAuthenticated === undefined) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  // If authenticated, render the protected component
  return children;
};

const App = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/v1/user/me", { 
          withCredentials: true 
        });
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    getUser();
  }, [setIsAuthenticated, setUser]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/otp-verification/:email/:phone" element={<OtpVerification />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/entries" 
            element={
              <PrivateRoute>
                <Entries />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <PrivateRoute>
                <AnalyticsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
        </Routes>
        
        {/* Only show navbar when authenticated */}
        <AppNavbar />
        <ToastContainer theme="colored" />
      </Router>
    </>
  );
};

export default App;