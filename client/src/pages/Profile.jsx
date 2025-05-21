import React, { useContext, useState } from 'react';
import { Context } from '../main';
import { Navigate, useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { isAuthenticated, user, setUser, setIsAuthenticated } = useContext(Context);
  const [language, setLanguage] = useState('en'); // 'en' for English, 'hi' for Hindi
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:4000/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success("Logged out successfully");
      setUser(null);
      setIsAuthenticated(false);
      navigateTo("/auth");
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    // In a real app, you would store this preference and apply it globally
    localStorage.setItem('preferredLanguage', selectedLanguage);
    toast.success(`Language changed to ${selectedLanguage === 'en' ? 'English' : 'Hindi'}`);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your financial data? This action cannot be undone.')) {
      localStorage.removeItem('mydehadiEntries');
      toast.success('All data cleared successfully');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/auth"} />;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="profile-details">
          <h2>{user?.name || 'User'}</h2>
          <p>{user?.email || 'email@example.com'}</p>
          <p>{user?.phone || '+91 XXXXXXXXXX'}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Preferences</h3>
        
        <div className="preference-item">
          <span>Language</span>
          <div className="language-buttons">
            <button 
              className={language === 'en' ? 'active' : ''}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </button>
            <button 
              className={language === 'hi' ? 'active' : ''}
              onClick={() => handleLanguageChange('hi')}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        <div className="preference-item">
          <span>Theme</span>
          <select>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div className="preference-item">
          <span>Currency</span>
          <select>
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
      </div>

      <div className="profile-section">
        <h3>Account</h3>
        
        <button className="danger-button" onClick={clearAllData}>
          Clear All Financial Data
        </button>
        
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="app-info">
        <p>MyDehadi v1.0.0</p>
        <p>Your Personal Finance Tracker</p>
      </div>
    </div>
  );
};

export default Profile;