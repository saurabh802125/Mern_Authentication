import React, { useState } from 'react';
import '../styles/AddEntry.css';

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Bonus', 'Gift', 'Investment', 'Other'
];

const EXPENSE_CATEGORIES = [
  'Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 
  'Shopping', 'Healthcare', 'Education', 'Personal', 'Travel', 'Other'
];

const AddEntry = ({ onAdd, onCancel }) => {
  const [entryType, setEntryType] = useState('income'); // 'income' or 'expense'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!category) {
      alert('Please select a category');
      return;
    }
    
    // Create entry object
    const entryData = {
      type: entryType,
      amount: parseFloat(amount),
      category,
      description,
      date,
      timestamp: new Date().toISOString()
    };
    
    // Pass data to parent component
    onAdd(entryData);
    
    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().substr(0, 10));
  };

  return (
    <div className="add-entry">
      <div className="add-entry-header">
        <h2>Add New Entry</h2>
        <button className="close-button" onClick={onCancel}>×</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="entry-type-selector">
          <button 
            type="button"
            className={`type-button ${entryType === 'income' ? 'active' : ''}`}
            onClick={() => setEntryType('income')}
          >
            Income
          </button>
          <button 
            type="button"
            className={`type-button ${entryType === 'expense' ? 'active' : ''}`}
            onClick={() => setEntryType('expense')}
          >
            Expense
          </button>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {entryType === 'income' 
              ? INCOME_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              : EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
            }
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-button">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEntry;