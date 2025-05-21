import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../main';
import EntryList from '../components/EntryList';
import AddEntry from '../components/AddEntry';
import '../styles/Entries.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const Entries = () => {
  const { isAuthenticated } = useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    category: ''
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  // Check for edit parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    
    if (editId) {
      fetchEntryById(editId);
    }
  }, [location.search]);

  // Fetch all entries on component mount
  useEffect(() => {
    fetchEntries();
  }, [filters]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {};
      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.category) params.category = filters.category;
      
      const response = await axios.get('http://localhost:4000/api/v1/entries', {
        params,
        withCredentials: true
      });
      
      if (response.data.success) {
        setEntries(response.data.entries);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load entries');
      setLoading(false);
    }
  };

  const fetchEntryById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/v1/entries/${id}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setEditingEntry(response.data.entry);
        // Clear the URL parameter without reloading
        navigate('/entries', { replace: true });
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      toast.error('Failed to load entry details');
      navigate('/entries', { replace: true });
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
        fetchEntries(); // Refresh entries list
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error(error.response?.data?.message || 'Failed to add entry');
    }
  };

  const handleUpdateEntry = async (updatedEntry) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/entries/${updatedEntry._id}`,
        updatedEntry,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Entry updated successfully');
        setEditingEntry(null);
        fetchEntries(); // Refresh entries list
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error(error.response?.data?.message || 'Failed to update entry');
    }
  };

  const handleDeleteEntry = async (entryToDelete) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await axios.delete(
          `http://localhost:4000/api/v1/entries/${entryToDelete._id}`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          toast.success('Entry deleted successfully');
          fetchEntries(); // Refresh entries list
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        toast.error(error.response?.data?.message || 'Failed to delete entry');
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Translations for bilingual support
  const translations = {
    en: {
      myEntries: "My Entries",
      addEntry: "Add New Entry",
      loading: "Loading entries..."
    },
    hi: {
      myEntries: "मेरी प्रविष्टियां",
      addEntry: "नई प्रविष्टि जोड़ें",
      loading: "प्रविष्टियां लोड हो रही हैं..."
    }
  };

  const t = translations[language];

  return (
    <div className="entries-page">
      <div className="entries-header">
        <h1>{t.myEntries}</h1>
        <button 
          className="add-button"
          onClick={() => setShowAddEntry(true)}
        >
          + {t.addEntry}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t.loading}</div>
      ) : (
        <EntryList 
          entries={entries} 
          onEdit={(entry) => setEditingEntry(entry)}
          onDelete={handleDeleteEntry}
          onFilterChange={handleFilterChange}
          language={language}
        />
      )}

      {showAddEntry && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddEntry 
              onAdd={handleAddEntry}
              onCancel={() => setShowAddEntry(false)}
              language={language}
            />
          </div>
        </div>
      )}

      {editingEntry && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddEntry 
              entry={editingEntry}
              onAdd={handleUpdateEntry}
              onCancel={() => setEditingEntry(null)}
              isEditing={true}
              language={language}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Entries;