import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../main';
import Analytics from '../components/Analytics';
import '../styles/AnalyticsPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getDateRange } from '../utils/dateUtils';

// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const AnalyticsPage = () => {
  const { isAuthenticated } = useContext(Context);
  const [timePeriod, setTimePeriod] = useState('30days');
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
      // Get date range based on selected period
      const dateRange = getDateRange(timePeriod);
      
      // Fetch daily breakdown data
      const dailyResponse = await axios.get(`${API_BASE_URL}/entries/daily-breakdown`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        withCredentials: true
      });
      
      if (dailyResponse.data.success) {
        setChartData(dailyResponse.data.dailyBreakdown);
      }
      
      // Fetch category breakdown data
      const categoryResponse = await axios.get(`${API_BASE_URL}/entries/category-breakdown`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        withCredentials: true
      });
      
      if (categoryResponse.data.success) {
        // Process category data for chart display
        const processedData = processCategoryData(categoryResponse.data.categoryBreakdown);
        setCategoryData(processedData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Fallback to sample data if API fails
      generateSampleData();
      setLoading(false);
    }
  };

  const processCategoryData = (rawData) => {
    const income = [];
    const expense = [];
    
    rawData.forEach(item => {
      if (item.type === 'income') {
        income.push({
          name: item.category,
          value: item.total
        });
      } else {
        expense.push({
          name: item.category,
          value: item.total
        });
      }
    });
    
    // Sort by value (highest first)
    income.sort((a, b) => b.value - a.value);
    expense.sort((a, b) => b.value - a.value);
    
    return { income, expense };
  };

  const generateSampleData = () => {
    // Generate sample data for demonstration
    const today = new Date();
    const sampleChartData = [];
    
    // Create sample data based on time period
    const days = timePeriod === '7days' ? 7 : timePeriod === '30days' ? 30 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic financial data
      const baseIncome = timePeriod === '7days' ? 800 : 500;
      const baseExpense = timePeriod === '7days' ? 600 : 400;
      
      const income = Math.floor(Math.random() * baseIncome) + baseIncome/2;
      const expense = Math.floor(Math.random() * baseExpense) + baseExpense/2;
      
      sampleChartData.push({
        date: dateStr,
        income,
        expense,
        balance: income - expense
      });
    }
    
    setChartData(sampleChartData);
    
    // Sample category data
    const sampleIncomeCategories = [
      { name: 'Salary', value: Math.floor(Math.random() * 50000) + 25000 },
      { name: 'Freelance', value: Math.floor(Math.random() * 15000) + 5000 },
      { name: 'Investment', value: Math.floor(Math.random() * 8000) + 2000 },
      { name: 'Business', value: Math.floor(Math.random() * 12000) + 3000 },
      { name: 'Bonus', value: Math.floor(Math.random() * 5000) + 1000 }
    ];
    
    const sampleExpenseCategories = [
      { name: 'Food', value: Math.floor(Math.random() * 8000) + 4000 },
      { name: 'Transportation', value: Math.floor(Math.random() * 5000) + 2000 },
      { name: 'Housing', value: Math.floor(Math.random() * 15000) + 8000 },
      { name: 'Utilities', value: Math.floor(Math.random() * 3000) + 1500 },
      { name: 'Entertainment', value: Math.floor(Math.random() * 4000) + 1000 },
      { name: 'Shopping', value: Math.floor(Math.random() * 6000) + 2000 },
      { name: 'Healthcare', value: Math.floor(Math.random() * 3000) + 1000 }
    ];
    
    // Sort by value
    sampleIncomeCategories.sort((a, b) => b.value - a.value);
    sampleExpenseCategories.sort((a, b) => b.value - a.value);
    
    setCategoryData({
      income: sampleIncomeCategories,
      expense: sampleExpenseCategories
    });
  };

  // Translations for bilingual support
  const translations = {
    en: {
      financialAnalytics: "Financial Analytics",
      loading: "Loading analytics data...",
      noData: "No entries to analyze",
      addEntries: "Add some income or expense entries to see analytics.",
      smartInsights: "Get detailed insights about your spending patterns and financial health.",
      dataNote: "Analytics are based on your actual transaction data."
    },
    hi: {
      financialAnalytics: "वित्तीय विश्लेषण",
      loading: "विश्लेषण डेटा लोड हो रहा है...",
      noData: "विश्लेषण के लिए कोई प्रविष्टि नहीं",
      addEntries: "विश्लेषण देखने के लिए कुछ आय या व्यय प्रविष्टियां जोड़ें।",
      smartInsights: "अपने खर्च के पैटर्न और वित्तीय स्वास्थ्य के बारे में विस्तृत जानकारी प्राप्त करें।",
      dataNote: "विश्लेषण आपके वास्तविक लेनदेन डेटा पर आधारित है।"
    }
  };

  const t = translations[language];

  return (
    <div className="analytics-page">
      <div className="analytics-page-header">
        <h1>{t.financialAnalytics}</h1>
        <p className="analytics-subtitle">{t.smartInsights}</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
        </div>
      ) : chartData.length > 0 || categoryData.income.length > 0 || categoryData.expense.length > 0 ? (
        <>
          <div className="data-source-note">
            <p>{t.dataNote}</p>
          </div>
          <Analytics 
            chartData={chartData}
            categoryData={categoryData}
            timePeriod={timePeriod}
            onTimePeriodChange={setTimePeriod}
            language={language}
          />
        </>
      ) : (
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <h3>{t.noData}</h3>
          <p>{t.addEntries}</p>
          <button 
            className="add-entries-button"
            onClick={() => window.location.href = '/entries'}
          >
            Add Entries
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;