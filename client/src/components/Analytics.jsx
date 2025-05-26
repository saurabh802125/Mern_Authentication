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
    balance: 0,
    avgDailyIncome: 0,
    avgDailyExpense: 0,
    highestExpenseDay: null,
    lowestExpenseDay: null,
    savingsRate: 0,
    expenseGrowth: 0,
    incomeGrowth: 0
  });
  const [insights, setInsights] = useState([]);

  // Calculate comprehensive summary data and insights
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const totalIncome = chartData.reduce((sum, day) => sum + day.income, 0);
      const totalExpense = chartData.reduce((sum, day) => sum + day.expense, 0);
      const balance = totalIncome - totalExpense;
      
      // Calculate averages
      const avgDailyIncome = totalIncome / chartData.length;
      const avgDailyExpense = totalExpense / chartData.length;
      
      // Find highest and lowest expense days
      const sortedByExpense = [...chartData].sort((a, b) => b.expense - a.expense);
      const highestExpenseDay = sortedByExpense[0];
      const lowestExpenseDay = sortedByExpense[sortedByExpense.length - 1];
      
      // Calculate savings rate
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
      
      // Calculate growth rates (comparing first half vs second half)
      const midPoint = Math.floor(chartData.length / 2);
      const firstHalf = chartData.slice(0, midPoint);
      const secondHalf = chartData.slice(midPoint);
      
      const firstHalfExpense = firstHalf.reduce((sum, day) => sum + day.expense, 0) / firstHalf.length;
      const secondHalfExpense = secondHalf.reduce((sum, day) => sum + day.expense, 0) / secondHalf.length;
      const expenseGrowth = firstHalfExpense > 0 ? ((secondHalfExpense - firstHalfExpense) / firstHalfExpense) * 100 : 0;
      
      const firstHalfIncome = firstHalf.reduce((sum, day) => sum + day.income, 0) / firstHalf.length;
      const secondHalfIncome = secondHalf.reduce((sum, day) => sum + day.income, 0) / secondHalf.length;
      const incomeGrowth = firstHalfIncome > 0 ? ((secondHalfIncome - firstHalfIncome) / firstHalfIncome) * 100 : 0;
      
      setSummaryData({
        totalIncome,
        totalExpense,
        balance,
        avgDailyIncome,
        avgDailyExpense,
        highestExpenseDay,
        lowestExpenseDay,
        savingsRate,
        expenseGrowth,
        incomeGrowth
      });
      
      // Generate insights
      generateInsights({
        totalIncome,
        totalExpense,
        balance,
        avgDailyIncome,
        avgDailyExpense,
        savingsRate,
        expenseGrowth,
        incomeGrowth
      });
    }
  }, [chartData]);

  const generateInsights = (data) => {
    const newInsights = [];
    
    // Savings rate insights
    if (data.savingsRate > 20) {
      newInsights.push({
        type: 'positive',
        title: 'Excellent Savings Rate! 🎉',
        description: `You're saving ${data.savingsRate.toFixed(1)}% of your income. Keep up the great work!`
      });
    } else if (data.savingsRate > 10) {
      newInsights.push({
        type: 'neutral',
        title: 'Good Savings Habit 👍',
        description: `You're saving ${data.savingsRate.toFixed(1)}% of your income. Try to increase it to 20% for better financial health.`
      });
    } else if (data.savingsRate > 0) {
      newInsights.push({
        type: 'warning',
        title: 'Room for Improvement 📈',
        description: `Your savings rate is ${data.savingsRate.toFixed(1)}%. Consider reducing expenses to save at least 10% of income.`
      });
    } else {
      newInsights.push({
        type: 'negative',
        title: 'Spending Alert! ⚠️',
        description: 'You\'re spending more than you earn. Review your expenses and create a budget.'
      });
    }
    
    // Expense growth insights
    if (data.expenseGrowth > 10) {
      newInsights.push({
        type: 'warning',
        title: 'Rising Expenses 📊',
        description: `Your expenses have increased by ${data.expenseGrowth.toFixed(1)}%. Monitor your spending carefully.`
      });
    } else if (data.expenseGrowth < -5) {
      newInsights.push({
        type: 'positive',
        title: 'Expense Control 💰',
        description: `Great job! Your expenses decreased by ${Math.abs(data.expenseGrowth).toFixed(1)}%.`
      });
    }
    
    // Income growth insights
    if (data.incomeGrowth > 5) {
      newInsights.push({
        type: 'positive',
        title: 'Income Growth 🚀',
        description: `Your income has grown by ${data.incomeGrowth.toFixed(1)}%. Consider increasing your savings rate.`
      });
    }
    
    // Daily spending insights
    if (data.avgDailyExpense > data.avgDailyIncome) {
      newInsights.push({
        type: 'negative',
        title: 'Daily Deficit 📉',
        description: `You spend ₹${data.avgDailyExpense.toFixed(0)} daily but earn ₹${data.avgDailyIncome.toFixed(0)}. Create a daily budget.`
      });
    }
    
    setInsights(newInsights);
  };

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
      avgDaily: "Avg Daily",
      savingsRate: "Savings Rate",
      overview: "Overview",
      byCategory: "By Category",
      trends: "Trends",
      insights: "Smart Insights",
      expenseBreakdown: "Expense Breakdown",
      incomeByCategory: "Income by Category",
      expenseByCategory: "Expense by Category",
      noData: "No data available for the selected period",
      highestExpense: "Highest Expense Day",
      lowestExpense: "Lowest Expense Day",
      financialHealth: "Financial Health Score",
      spendingPattern: "Spending Pattern Analysis",
      budgetRecommendation: "Budget Recommendations"
    },
    hi: {
      sevenDays: "7 दिन",
      thirtyDays: "पिछले 30 दिन", 
      thisMonth: "इस महीने",
      lastMonth: "पिछले महीने",
      totalIncome: "कुल आय",
      totalExpense: "कुल व्यय",
      balance: "शेष राशि",
      avgDaily: "दैनिक औसत",
      savingsRate: "बचत दर",
      overview: "अवलोकन",
      byCategory: "श्रेणी के अनुसार",
      trends: "प्रवृत्तियाँ",
      insights: "स्मार्ट सुझाव",
      expenseBreakdown: "व्यय विश्लेषण",
      incomeByCategory: "श्रेणी के अनुसार आय",
      expenseByCategory: "श्रेणी के अनुसार व्यय",
      noData: "चयनित अवधि के लिए कोई डेटा उपलब्ध नहीं है",
      highestExpense: "सबसे अधिक व्यय का दिन",
      lowestExpense: "सबसे कम व्यय का दिन",
      financialHealth: "वित्तीय स्वास्थ्य स्कोर",
      spendingPattern: "खर्च पैटर्न विश्लेषण",
      budgetRecommendation: "बजट सिफारिशें"
    }
  };

  const t = translations[language || 'en'];

  // Enhanced data visualization component
  const renderAdvancedAnalytics = () => {
    if (!chartData || chartData.length === 0) {
      return <div className="no-data">{t.noData}</div>;
    }

    if (chartType === 'overview') {
      return (
        <div className="advanced-overview">
          <div className="financial-metrics">
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <h4>{t.avgDaily} Income</h4>
                <p className="metric-value income">₹{summaryData.avgDailyIncome.toFixed(0)}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">💸</div>
              <div className="metric-content">
                <h4>{t.avgDaily} Expense</h4>
                <p className="metric-value expense">₹{summaryData.avgDailyExpense.toFixed(0)}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <h4>{t.savingsRate}</h4>
                <p className={`metric-value ${summaryData.savingsRate >= 0 ? 'positive' : 'negative'}`}>
                  {summaryData.savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="data-table">
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
                {chartData.map((day, index) => (
                  <tr key={index}>
                    <td>{formatDate(day.date, { month: 'short', day: 'numeric' })}</td>
                    <td className="income">₹{day.income.toFixed(0)}</td>
                    <td className="expense">₹{day.expense.toFixed(0)}</td>
                    <td className={day.balance >= 0 ? 'income' : 'expense'}>
                      ₹{day.balance.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (chartType === 'category') {
      return (
        <div className="category-analysis">
          <div className="tables-container">
            <div className="category-table">
              <h3>{t.incomeByCategory}</h3>
              <div className="category-grid">
                {categoryData.income.map((category, index) => {
                  const percentage = ((category.value / summaryData.totalIncome) * 100).toFixed(1);
                  return (
                    <div key={index} className="category-item">
                      <div className="category-header">
                        <span 
                          className="color-indicator" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className="category-name">{category.name}</span>
                      </div>
                      <div className="category-stats">
                        <span className="category-amount income">₹{category.value.toFixed(0)}</span>
                        <span className="category-percentage">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="category-table">
              <h3>{t.expenseByCategory}</h3>
              <div className="category-grid">
                {categoryData.expense.map((category, index) => {
                  const percentage = ((category.value / summaryData.totalExpense) * 100).toFixed(1);
                  return (
                    <div key={index} className="category-item">
                      <div className="category-header">
                        <span 
                          className="color-indicator" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className="category-name">{category.name}</span>
                      </div>
                      <div className="category-stats">
                        <span className="category-amount expense">₹{category.value.toFixed(0)}</span>
                        <span className="category-percentage">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (chartType === 'insights') {
      return (
        <div className="insights-container">
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <h4>{insight.title}</h4>
                <p>{insight.description}</p>
              </div>
            ))}
          </div>
          
          <div className="financial-health-score">
            <h3>Financial Health Score</h3>
            <div className="health-score">
              <div className="score-circle">
                <div className="score-value">
                  {Math.max(0, Math.min(100, Math.round(50 + summaryData.savingsRate * 2)))}
                </div>
                <div className="score-label">/ 100</div>
              </div>
            </div>
            <div className="health-indicators">
              <div className="indicator">
                <span className="indicator-label">Savings Rate:</span>
                <span className={`indicator-value ${summaryData.savingsRate >= 20 ? 'good' : summaryData.savingsRate >= 10 ? 'average' : 'poor'}`}>
                  {summaryData.savingsRate >= 20 ? 'Excellent' : summaryData.savingsRate >= 10 ? 'Good' : 'Needs Work'}
                </span>
              </div>
              <div className="indicator">
                <span className="indicator-label">Expense Control:</span>
                <span className={`indicator-value ${summaryData.expenseGrowth <= 0 ? 'good' : summaryData.expenseGrowth <= 10 ? 'average' : 'poor'}`}>
                  {summaryData.expenseGrowth <= 0 ? 'Excellent' : summaryData.expenseGrowth <= 10 ? 'Good' : 'Needs Work'}
                </span>
              </div>
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
          <div className="amount income">₹{summaryData.totalIncome.toFixed(0)}</div>
        </div>
        <div className="summary-card">
          <h3>{t.totalExpense}</h3>
          <div className="amount expense">₹{summaryData.totalExpense.toFixed(0)}</div>
        </div>
        <div className="summary-card">
          <h3>{t.balance}</h3>
          <div className={`amount ${summaryData.balance >= 0 ? 'income' : 'expense'}`}>
            ₹{summaryData.balance.toFixed(0)}
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
          className={chartType === 'insights' ? 'active' : ''}
          onClick={() => setChartType('insights')}
        >
          {t.insights}
        </button>
      </div>
      
      <div className="chart-container">
        {renderAdvancedAnalytics()}
      </div>
    </div>
  );
};

export default Analytics;