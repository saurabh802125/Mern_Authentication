import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../main';
import '../styles/Dashboard.css';
import AddEntry from './AddEntry';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

const Dashboard = () => {
  const { user } = useContext(Context);
  const navigateTo = useNavigate();
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [summaryData, setSummaryData] = useState({
    today: { income: 0, expense: 0, balance: 0 },
    thisWeek: { income: 0, expense: 0, balance: 0 },
    thisMonth: { income: 0, expense: 0, balance: 0 }
  });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch summary data
      const summaryRes = await axios.get('http://localhost:4000/api/v1/entries/summary', {
        withCredentials: true
      });
      
      if (summaryRes.data.success) {
        setSummaryData(summaryRes.data.summary);
      }
      
      // Fetch recent entries - limited to 5
      const entriesRes = await axios.get('http://localhost:4000/api/v1/entries', {
        params: {
          sort: 'date:desc',
          limit: 5
        },
        withCredentials: true
      });
      
      if (entriesRes.data.success) {
        setEntries(entriesRes.data.entries);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleAddEntry = async (entryData) => {
    try {
      const response = await axios.post(
        'http://localhost:4000/api/v1/entries',
        entryData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Entry added successfully');
        setShowAddEntry(false);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error(error.response?.data?.message || 'Failed to add entry');
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const viewAllEntries = () => {
    navigateTo('/entries');
  };

  const viewAnalytics = () => {
    navigateTo('/analytics');
  };

  // Translations for bilingual support
  const translations = {
    en: {
      dashboard: "Dashboard",
      quickSummary: "Quick Summary",
      today: "TODAY",
      thisWeek: "THIS WEEK",
      thisMonth: "THIS MONTH",
      recentEntries: "Recent Transactions",
      noEntries: "No transactions recorded yet.",
      tapToAdd: "Tap the '+' button to add your first entry!",
      viewAll: "View All",
      viewAnalytics: "View Analytics",
      welcome: "Welcome back",
      financialOverview: "Your Financial Overview"
    },
    hi: {
      dashboard: "डैशबोर्ड",
      quickSummary: "त्वरित सारांश",
      today: "आज",
      thisWeek: "इस सप्ताह",
      thisMonth: "इस महीने",
      recentEntries: "हाल की लेनदारी",
      noEntries: "अभी तक कोई लेनदेन दर्ज नहीं किया गया है।",
      tapToAdd: "अपनी पहली प्रविष्टि जोड़ने के लिए '+' बटन पर टैप करें!",
      viewAll: "सभी देखें",
      viewAnalytics: "विश्लेषण देखें",
      welcome: "वापसी पर स्वागत है",
      financialOverview: "आपका वित्तीय अवलोकन"
    }
  };

  const t = translations[language];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>E Smart Wallet</h1>
          <p className="welcome-text">{t.welcome}, {user?.name || 'User'}!</p>
        </div>
        <div className="language-selector">
          <select 
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      <div className="financial-overview">
        <h2>{t.financialOverview}</h2>
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Monthly Balance</h3>
              <p className={`stat-value ${summaryData.thisMonth.balance >= 0 ? 'positive' : 'negative'}`}>
                ₹{summaryData.thisMonth.balance.toFixed(0)}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>This Month Income</h3>
              <p className="stat-value positive">₹{summaryData.thisMonth.income.toFixed(0)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📉</div>
            <div className="stat-content">
              <h3>This Month Expense</h3>
              <p className="stat-value negative">₹{summaryData.thisMonth.expense.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-summary">
        <h2>{t.quickSummary}</h2>
        
        <div className="summary-card">
          <div className="summary-icon">
            <span>📅</span>
          </div>
          <div className="summary-content">
            <div className="summary-title">{t.today}</div>
            <div className="summary-amount">₹{summaryData.today.balance}</div>
            <div className="summary-details">
              <span className="income-detail">+₹{summaryData.today.income}</span>
              <span className="expense-detail">-₹{summaryData.today.expense}</span>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <span>📊</span>
          </div>
          <div className="summary-content">
            <div className="summary-title">{t.thisWeek}</div>
            <div className="summary-amount">₹{summaryData.thisWeek.balance}</div>
            <div className="summary-details">
              <span className="income-detail">+₹{summaryData.thisWeek.income}</span>
              <span className="expense-detail">-₹{summaryData.thisWeek.expense}</span>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <span>📆</span>
          </div>
          <div className="summary-content">
            <div className="summary-title">{t.thisMonth}</div>
            <div className="summary-amount">₹{summaryData.thisMonth.balance}</div>
            <div className="summary-details">
              <span className="income-detail">+₹{summaryData.thisMonth.income}</span>
              <span className="expense-detail">-₹{summaryData.thisMonth.expense}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="entries-section">
        <div className="entries-header">
          <h2>{t.recentEntries}</h2>
          <div className="header-actions">
            {entries.length > 0 && (
              <>
                <button className="view-all-button" onClick={viewAllEntries}>
                  {t.viewAll}
                </button>
                <button className="analytics-button" onClick={viewAnalytics}>
                  {t.viewAnalytics}
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading entries...</div>
        ) : entries.length > 0 ? (
          <div className="entry-list">
            {entries.map((entry) => (
              <div 
                key={entry._id} 
                className={`entry-item ${entry.type === 'income' ? 'income' : 'expense'}`}
                onClick={() => navigateTo(`/entries?edit=${entry._id}`)}
              >
                <div className="entry-info">
                  <div className="entry-date">{formatDate(entry.date)}</div>
                  <div className="entry-details">
                    <span className="entry-category">{entry.category}</span>
                    {entry.description && (
                      <span className="entry-description">{entry.description}</span>
                    )}
                  </div>
                </div>
                <div className="entry-amount">
                  {entry.type === 'income' ? '+' : '-'}₹{entry.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-entries">
            <div className="no-entries-icon">💳</div>
            <p>{t.noEntries}</p>
            <p>{t.tapToAdd}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="quick-action-btn income-btn"
          onClick={() => setShowAddEntry(true)}
        >
          <span className="action-icon">💰</span>
          <span>Add Income</span>
        </button>
        <button 
          className="quick-action-btn expense-btn"
          onClick={() => setShowAddEntry(true)}
        >
          <span className="action-icon">💸</span>
          <span>Add Expense</span>
        </button>
      </div>

      {showAddEntry ? (
        <div className="add-entry-overlay">
          <AddEntry 
            onAdd={handleAddEntry} 
            onCancel={() => setShowAddEntry(false)} 
            language={language}
          />
        </div>
      ) : (
        <button 
          className="add-entry-button" 
          onClick={() => setShowAddEntry(true)}
        >
          +
        </button>
      )}
    </div>
  );
};

export default Dashboard;