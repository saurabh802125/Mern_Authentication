import React, { useState, useEffect } from 'react';
import '../styles/Analytics.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/dateUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4CAF50'];

const Analytics = ({ chartData, categoryData, timePeriod, onTimePeriodChange, language }) => {
  const [chartType, setChartType] = useState('overview');
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  // Calculate summary data from chart data
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const totalIncome = chartData.reduce((sum, day) => sum + day.income, 0);
      const totalExpense = chartData.reduce((sum, day) => sum + day.expense, 0);
      const balance = totalIncome - totalExpense;
      
      setSummaryData({
        totalIncome,
        totalExpense,
        balance
      });
    }
  }, [chartData]);

  // Translations for bilingual support
  const translations = {
    en: {
      sevenDays: "7 Days",
      thirtyDays: "Last 30 Days", 
      thisMonth: "This Month",
      lastMonth: "Last Month",
      totalIncome: "Total Income",
      totalExpense: "Total Expense",
      balance: "Balance",
      overview: "Overview",
      byCategory: "By Category",
      trends: "Trends",
      expenseBreakdown: "Expense Breakdown",
      incomeByCategory: "Income by Category",
      expenseByCategory: "Expense by Category",
      noData: "No data available for the selected period",
      chartsUnavailable: "Charts are currently unavailable. Please install recharts library.",
      installInstructions: "Run 'npm install recharts' in your project directory."
    },
    hi: {
      sevenDays: "7 दिन",
      thirtyDays: "पिछले 30 दिन", 
      thisMonth: "इस महीने",
      lastMonth: "पिछले महीने",
      totalIncome: "कुल आय",
      totalExpense: "कुल व्यय",
      balance: "शेष राशि",
      overview: "अवलोकन",
      byCategory: "श्रेणी के अनुसार",
      trends: "प्रवृत्तियाँ",
      expenseBreakdown: "व्यय विश्लेषण",
      incomeByCategory: "श्रेणी के अनुसार आय",
      expenseByCategory: "श्रेणी के अनुसार व्यय",
      noData: "चयनित अवधि के लिए कोई डेटा उपलब्ध नहीं है",
      chartsUnavailable: "चार्ट वर्तमान में उपलब्ध नहीं हैं। कृपया recharts लाइब्रेरी इंस्टॉल करें।",
      installInstructions: "अपनी प्रोजेक्ट डायरेक्टरी में 'npm install recharts' चलाएं।"
    }
  };

  const t = translations[language || 'en'];

  // Simple table-based visualization of data instead of charts
  const renderDataTable = () => {
    if (!chartData || chartData.length === 0) {
      return <div className="no-data">{t.noData}</div>;
    }

    if (chartType === 'overview') {
      // Format dates for display
      const formattedData = chartData.map(item => ({
        ...item,
        displayDate: formatDate(item.date, { month: 'short', day: 'numeric' })
      }));
      
      return (
        <div className="data-table">
          <div className="chart-message">
            <p>{t.chartsUnavailable}</p>
            <p>{t.installInstructions}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>{t.totalIncome}</th>
                <th>{t.totalExpense}</th>
                <th>{t.balance}</th>
              </tr>
            </thead>
            <tbody>
              {formattedData.map((day, index) => (
                <tr key={index}>
                  <td>{day.displayDate}</td>
                  <td className="income">₹{day.income.toFixed(2)}</td>
                  <td className="expense">₹{day.expense.toFixed(2)}</td>
                  <td className={day.balance >= 0 ? 'income' : 'expense'}>
                    ₹{day.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (chartType === 'category') {
      return (
        <div className="data-table">
          <div className="chart-message">
            <p>{t.chartsUnavailable}</p>
            <p>{t.installInstructions}</p>
          </div>
          <div className="tables-container">
            <div className="category-table">
              <h3>{t.incomeByCategory}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.income.map((category, index) => {
                    const percentage = ((category.value / summaryData.totalIncome) * 100).toFixed(1);
                    return (
                      <tr key={index}>
                        <td>
                          <span 
                            className="color-indicator" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></span>
                          {category.name}
                        </td>
                        <td className="income">₹{category.value.toFixed(2)}</td>
                        <td>{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="category-table">
              <h3>{t.expenseByCategory}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.expense.map((category, index) => {
                    const percentage = ((category.value / summaryData.totalExpense) * 100).toFixed(1);
                    return (
                      <tr key={index}>
                        <td>
                          <span 
                            className="color-indicator" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></span>
                          {category.name}
                        </td>
                        <td className="expense">₹{category.value.toFixed(2)}</td>
                        <td>{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="analytics-container">
      <div className="time-period-selector">
        <button 
          className={timePeriod === '7days' ? 'active' : ''}
          onClick={() => onTimePeriodChange('7days')}
        >
          {t.sevenDays}
        </button>
        <button 
          className={timePeriod === '30days' ? 'active' : ''}
          onClick={() => onTimePeriodChange('30days')}
        >
          {t.thirtyDays}
        </button>
        <button 
          className={timePeriod === 'thisMonth' ? 'active' : ''}
          onClick={() => onTimePeriodChange('thisMonth')}
        >
          {t.thisMonth}
        </button>
        <button 
          className={timePeriod === 'lastMonth' ? 'active' : ''}
          onClick={() => onTimePeriodChange('lastMonth')}
        >
          {t.lastMonth}
        </button>
      </div>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>{t.totalIncome}</h3>
          <div className="amount income">₹{summaryData.totalIncome.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <h3>{t.totalExpense}</h3>
          <div className="amount expense">₹{summaryData.totalExpense.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <h3>{t.balance}</h3>
          <div className={`amount ${summaryData.balance >= 0 ? 'income' : 'expense'}`}>
            ₹{summaryData.balance.toFixed(2)}
          </div>
        </div>
      </div>
      
      <div className="chart-type-selector">
        <button 
          className={chartType === 'overview' ? 'active' : ''}
          onClick={() => setChartType('overview')}
        >
          {t.overview}
        </button>
        <button 
          className={chartType === 'category' ? 'active' : ''}
          onClick={() => setChartType('category')}
        >
          {t.byCategory}
        </button>
        <button 
          className={chartType === 'trends' ? 'active' : ''}
          onClick={() => setChartType('trends')}
        >
          {t.trends}
        </button>
      </div>
      
      <div className="chart-container">
        {renderDataTable()}
      </div>
      
      {chartType === 'category' && categoryData.expense.length > 0 && (
        <div className="expense-breakdown">
          <h3>{t.expenseBreakdown}</h3>
          <div className="breakdown-list">
            {categoryData.expense.map((category, index) => (
              <div key={index} className="breakdown-item">
                <div className="category-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <div className="category-name">{category.name}</div>
                <div className="category-amount">₹{category.value.toFixed(2)}</div>
                <div className="category-percentage">
                  {((category.value / summaryData.totalExpense) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;