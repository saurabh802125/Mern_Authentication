import React, { useState } from 'react';
import '../styles/EntryList.css';

const EntryList = ({ entries, onDelete, onEdit }) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Filter entries based on type
  const filteredEntries = entries.filter(entry => {
    if (filterType === 'all') return true;
    return entry.type === filterType;
  });

  // Sort entries based on sortBy and sortOrder
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  // Format date to display in a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="entry-list-container">
      <div className="entry-list-filters">
        <div className="filter-group">
          <label>Show:</label>
          <div className="filter-buttons">
            <button 
              className={filterType === 'all' ? 'active' : ''} 
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button 
              className={filterType === 'income' ? 'active' : ''} 
              onClick={() => setFilterType('income')}
            >
              Income
            </button>
            <button 
              className={filterType === 'expense' ? 'active' : ''} 
              onClick={() => setFilterType('expense')}
            >
              Expense
            </button>
          </div>
        </div>
        
        <div className="sort-group">
          <label>Sort by:</label>
          <select 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          >
            <option value="date-desc">Date (Newest first)</option>
            <option value="date-asc">Date (Oldest first)</option>
            <option value="amount-desc">Amount (Highest first)</option>
            <option value="amount-asc">Amount (Lowest first)</option>
          </select>
        </div>
      </div>

      {sortedEntries.length > 0 ? (
        <div className="entry-items">
          {sortedEntries.map((entry, index) => (
            <div 
              key={index} 
              className={`entry-item ${entry.type === 'income' ? 'income' : 'expense'}`}
            >
              <div className="entry-date">{formatDate(entry.date)}</div>
              <div className="entry-details">
                <div className="entry-category">{entry.category}</div>
                {entry.description && (
                  <div className="entry-description">{entry.description}</div>
                )}
              </div>
              <div className="entry-amount">
                <span className="amount">
                  {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toFixed(2)}
                </span>
                <div className="entry-actions">
                  <button 
                    className="edit-button" 
                    onClick={() => onEdit(entry)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => onDelete(entry)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-entries">
          <p>No entries found.</p>
          {filterType !== 'all' && (
            <p>Try changing the filter to see all entries.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EntryList;