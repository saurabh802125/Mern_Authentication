import React, { useContext, useState } from 'react';
import { Context } from '../main';
import { Navigate, useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { isAuthenticated, user, setUser, setIsAuthenticated } = useContext(Context);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });
  const [isClearing, setIsClearing] = useState(false);
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
    localStorage.setItem('preferredLanguage', selectedLanguage);
    toast.success(`Language changed to ${selectedLanguage === 'en' ? 'English' : 'Hindi'}`);
  };

  const clearAllData = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to clear all your financial data? This action cannot be undone.\n\nThis will delete:\n• All income entries\n• All expense entries\n• All transaction history\n• All analytics data'
    );
    
    if (!confirmed) return;

    // Double confirmation for safety
    const doubleConfirmed = window.confirm(
      '⚠️ FINAL WARNING ⚠️\n\nThis will permanently delete ALL your financial data. Are you absolutely sure?'
    );
    
    if (!doubleConfirmed) return;

    setIsClearing(true);
    
    try {
      // Method 1: Try to delete all entries via API
      const response = await axios.delete('http://localhost:4000/api/v1/entries/all', {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success('All financial data cleared successfully!');
      } else {
        throw new Error('Failed to clear data via API');
      }
    } catch (error) {
      console.log('API method failed, trying alternative methods...', error);
      
      try {
        // Method 2: Delete entries one by one if bulk delete not available
        const entriesResponse = await axios.get('http://localhost:4000/api/v1/entries', {
          withCredentials: true
        });
        
        if (entriesResponse.data.success && entriesResponse.data.entries.length > 0) {
          const deletePromises = entriesResponse.data.entries.map(entry => 
            axios.delete(`http://localhost:4000/api/v1/entries/${entry._id}`, {
              withCredentials: true
            })
          );
          
          await Promise.all(deletePromises);
          toast.success(`Successfully deleted ${entriesResponse.data.entries.length} financial entries!`);
        } else {
          toast.info('No financial data found to clear.');
        }
      } catch (fallbackError) {
        console.log('Individual delete method failed, using localStorage cleanup...', fallbackError);
        
        // Method 3: Clear localStorage as final fallback
        const localStorageKeys = [
          'mydehadiEntries',
          'mySmartWalletEntries', 
          'financialEntries',
          'entries',
          'transactionData',
          'expenseData',
          'incomeData'
        ];
        
        let clearedCount = 0;
        localStorageKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            clearedCount++;
          }
        });
        
        if (clearedCount > 0) {
          toast.success(`Cleared ${clearedCount} local data entries!`);
        } else {
          toast.info('No local financial data found to clear.');
        }
      }
    } finally {
      setIsClearing(false);
      
      // Refresh the page after a short delay to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  // Translations
  const translations = {
    en: {
      profile: "Profile",
      preferences: "Preferences",
      language: "Language",
      theme: "Theme",
      currency: "Currency",
      account: "Account",
      clearAllData: "Clear All Financial Data",
      logout: "Logout",
      appVersion: "E Smart Wallet v1.0.0",
      tagline: "Your Personal Finance Tracker",
      clearing: "Clearing data...",
      dark: "Dark",
      light: "Light"
    },
    hi: {
      profile: "प्रोफ़ाइल",
      preferences: "प्राथमिकताएं",
      language: "भाषा",
      theme: "थीम",
      currency: "मुद्रा",
      account: "खाता",
      clearAllData: "सभी वित्तीय डेटा साफ़ करें",
      logout: "लॉग आउट",
      appVersion: "ई स्मार्ट वॉलेट v1.0.0",
      tagline: "आपका व्यक्तिगत वित्त ट्रैकर",
      clearing: "डेटा साफ़ किया जा रहा है...",
      dark: "डार्क",
      light: "लाइट"
    }
  };

  const t = translations[language];

  if (!isAuthenticated) {
    return <Navigate to={"/auth"} />;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>{t.profile}</h1>
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
        <h3>{t.preferences}</h3>
        
        <div className="preference-item">
          <span>{t.language}</span>
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
          <span>{t.theme}</span>
          <select>
            <option value="dark">{t.dark}</option>
            <option value="light">{t.light}</option>
          </select>
        </div>

        <div className="preference-item">
          <span>{t.currency}</span>
          <select>
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
      </div>

      <div className="profile-section">
        <h3>{t.account}</h3>
        
        <button 
          className="danger-button" 
          onClick={clearAllData}
          disabled={isClearing}
        >
          {isClearing ? (
            <>
              <span className="loading-spinner"></span>
              {t.clearing}
            </>
          ) : (
            <>
              🗑️ {t.clearAllData}
            </>
          )}
        </button>
        
        <button className="logout-button" onClick={handleLogout}>
          🚪 {t.logout}
        </button>
      </div>

      <div className="app-info">
        <p>{t.appVersion}</p>
        <p>{t.tagline}</p>
      </div>
    </div>
  );
};

export default Profile;