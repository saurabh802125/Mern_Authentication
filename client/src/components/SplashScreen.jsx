import React, { useState, useEffect } from 'react';
import '../styles/SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 500); // Wait for fade out animation
    }, 7000); // Show for 7 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
      {/* Background with gradient and grid pattern */}
      <div className="splash-background">
        <div className="grid-pattern"></div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Animated financial icons */}
      <div className="floating-icons">
        <div className="icon icon-1">₹</div>
        <div className="icon icon-2">📊</div>
        <div className="icon icon-3">💰</div>
        <div className="icon icon-4">📈</div>
        <div className="icon icon-5">💳</div>
        <div className="icon icon-6">🏦</div>
      </div>

      {/* Main content */}
      <div className="splash-content">
        <div className="logo-container">
          <div className="logo-icon">
            <div className="rupee-symbol">₹</div>
            <div className="chart-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        <h1 className="welcome-text">
          <span className="welcome">Welcome to</span>
          <span className="app-name">E Smart Wallet</span>
        </h1>
        
        <p className="tagline">Your Personal Finance Companion</p>
        
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;