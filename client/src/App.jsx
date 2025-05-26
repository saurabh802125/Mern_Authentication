import React, { useContext, useEffect, useState } from "react";
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

// Floating Background Icons Component
const FloatingIcons = () => {
  const icons = [
    "🧮", "💰", "💳", "🏦", "📊", "💎", "🏛️", "💼", 
    "📈", "💵", "🔄", "💴", "📱", "💸", "🏪", "💲",
    "📉", "🎯", "💡", "🏷️", "📋", "🔍", "📑", "💯"
  ];

  return (
    <div className="floating-icons-background">
      {icons.map((icon, index) => (
        <div
          key={index}
          className={`floating-icon floating-icon-${index + 1}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${8 + Math.random() * 8}s`
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};

// Enhanced Splash Screen with Financial Icons
const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentText, setCurrentText] = useState("");
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    console.log("SplashScreen mounted");
    
    const animationTimeline = async () => {
      setTimeout(() => setCurrentText("Welcome to"), 1000);
      setTimeout(() => setShowFullMessage(true), 2500);
      setTimeout(() => setShowTagline(true), 4000);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onComplete(), 500);
      }, 7000);
    };

    animationTimeline();
  }, [onComplete]);

  const splashStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    color: 'white',
    textAlign: 'center',
    transition: 'opacity 0.5s ease-out',
    opacity: isVisible ? 1 : 0,
    fontFamily: '"Ubuntu", sans-serif',
    overflow: 'hidden'
  };

  const logoStyles = {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '30px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    animation: 'pulse 2s ease-in-out infinite',
    position: 'relative',
    zIndex: 10
  };

  // Floating icons for splash screen
  const splashFloatingIcons = [
    { icon: "💰", top: "10%", left: "10%", delay: "0s" },
    { icon: "📊", top: "15%", right: "15%", delay: "1s" },
    { icon: "💳", bottom: "20%", left: "8%", delay: "2s" },
    { icon: "🏦", bottom: "15%", right: "12%", delay: "3s" },
    { icon: "📈", top: "40%", left: "5%", delay: "4s" },
    { icon: "💎", top: "50%", right: "8%", delay: "5s" },
    { icon: "🧮", top: "25%", left: "85%", delay: "1.5s" },
    { icon: "💼", bottom: "40%", right: "20%", delay: "2.5s" }
  ];

  return (
    <div style={splashStyles}>
      {/* Background Grid Pattern */}
      <div className="grid-pattern"></div>
      
      {/* Splash Floating Icons */}
      {splashFloatingIcons.map((item, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            fontSize: '2rem',
            color: 'rgba(255, 255, 255, 0.3)',
            animation: `float 6s ease-in-out infinite`,
            animationDelay: item.delay,
            ...item
          }}
        >
          {item.icon}
        </div>
      ))}
      
      {/* Logo */}
      <div style={logoStyles}>₹</div>
      
      {/* Dynamic Welcome Message */}
      <div style={{
        fontSize: '24px',
        fontWeight: '300',
        marginBottom: '10px',
        opacity: currentText ? 1 : 0,
        transform: currentText ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease-out',
        zIndex: 10
      }}>
        {currentText}
      </div>
      
      <div style={{
        fontSize: '36px',
        fontWeight: '700',
        background: 'linear-gradient(45deg, #00d4ff, #ffffff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        opacity: showFullMessage ? 1 : 0,
        transform: showFullMessage ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
        transition: 'all 1s ease-out',
        marginBottom: '20px',
        zIndex: 10
      }}>
        E Smart Wallet
      </div>
      
      <div style={{
        fontSize: '18px',
        fontWeight: '300',
        opacity: showTagline ? 0.8 : 0,
        transform: showTagline ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease-out',
        marginTop: '10px',
        zIndex: 10
      }}>
        Your Personal Finance Companion
      </div>
      
      {/* Loading Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '40px',
        opacity: showTagline ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        zIndex: 10
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              animation: 'dotBounce 1.4s ease-in-out infinite',
              animationDelay: `${-0.32 + (i * 0.16)}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Private route component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(Context);
  
  if (isAuthenticated === false) {
    return <Navigate to="/auth" />;
  }
  
  if (isAuthenticated === undefined) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return children;
};

const App = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

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
      } finally {
        setIsInitialized(true);
      }
    };
    getUser();
  }, [setIsAuthenticated, setUser]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Add keyframe animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }
      }
      
      @keyframes dotBounce {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
      
      @keyframes float {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg); 
        }
        50% { 
          transform: translateY(-20px) rotate(10deg); 
        }
      }
      
      @keyframes floatBackground {
        0%, 100% { 
          transform: translateY(0px) translateX(0px) rotate(0deg); 
        }
        25% { 
          transform: translateY(-10px) translateX(5px) rotate(5deg); 
        }
        50% { 
          transform: translateY(-5px) translateX(-5px) rotate(-5deg); 
        }
        75% { 
          transform: translateY(-15px) translateX(3px) rotate(3deg); 
        }
      }
      
      .grid-pattern {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        background-size: 50px 50px;
        animation: gridMove 20s linear infinite;
      }
      
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(50px, 50px); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Show splash screen while initializing
  if (!isInitialized || showSplash) {
    return (
      <div>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        {!showSplash && !isInitialized && (
          <div className="app-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background with floating icons for entire app */}
      <FloatingIcons />
      
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/otp-verification/:email/:phone" element={<OtpVerification />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
          
          {/* Protected routes */}
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
        
        <AppNavbar />
        <ToastContainer theme="colored" />
      </Router>
    </div>
  );
};

export default App;