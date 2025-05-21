import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../main';
import Analytics from '../components/Analytics';
import '../styles/AnalyticsPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getDateRange } from '../utils/dateUtils';

const AnalyticsPage = () => {
  const { isAuthenticated } = useContext(Context);
  const [timePeriod, setTimePeriod] = useState('7days');
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState({ income: [], expense: [] });
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timePeriod]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // For demonstration without backend integration, create sample data
      // In a real implementation, you would fetch this from your API
      
      // Sample data for chart
      const today = new Date();
      const sampleChartData = [];
      
      // Create sample data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate random income and expense data
        const income = Math.floor(Math.random() * 1000) + 500;
        const expense = Math.floor(Math.random() * 800) + 200;
        
        sampleChartData.push({
          date: dateStr,
          income,
          expense,
          balance: income - expense
        });
      }
      
      setChartData(sampleChartData);
      
      // Sample data for categories
      const sampleIncomeCategories = [
        { name: 'Salary', value: 25000 },
        { name: 'Freelance', value: 5000 },
        { name: 'Investment', value: 2000 }
      ];
      
      const sampleExpenseCategories = [
        { name: 'Food', value: 6000 },
        { name: 'Transportation', value: 3000 },
        { name: 'Rent', value: 10000 },
        { name: 'Entertainment', value: 2000 },
        { name: 'Utilities', value: 4000 }
      ];
      
      setCategoryData({
        income: sampleIncomeCategories,
        expense: sampleExpenseCategories
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
      setLoading(false);
    }
  };

  // Translations for bilingual support
  const translations = {
    en: {
      financialAnalytics: "Financial Analytics",
      loading: "Loading analytics data...",
      noData: "No entries to analyze",
      addEntries: "Add some income or expense entries to see analytics.",
      installMessage: "To see charts, please install the recharts library:",
      installCommand: "npm install recharts"
    },
    hi: {
      financialAnalytics: "वित्तीय विश्लेषण",
      loading: "विश्लेषण डेटा लोड हो रहा है...",
      noData: "विश्लेषण के लिए कोई प्रविष्टि नहीं",
      addEntries: "विश्लेषण देखने के लिए कुछ आय या व्यय प्रविष्टियां जोड़ें।",
      installMessage: "चार्ट देखने के लिए, कृपया recharts लाइब्रेरी इंस्टॉल करें:",
      installCommand: "npm install recharts"
    }
  };

  const t = translations[language];

  return (
    <div className="analytics-page">
      <div className="analytics-page-header">
        <h1>{t.financialAnalytics}</h1>
      </div>

      <div className="recharts-notice">
        <p>{t.installMessage}</p>
        <code>{t.installCommand}</code>
      </div>

      {loading ? (
        <div className="loading">{t.loading}</div>
      ) : chartData.length > 0 || categoryData.income.length > 0 || categoryData.expense.length > 0 ? (
        <Analytics 
          chartData={chartData}
          categoryData={categoryData}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          language={language}
        />
      ) : (
        <div className="no-data-message">
          <h3>{t.noData}</h3>
          <p>{t.addEntries}</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;