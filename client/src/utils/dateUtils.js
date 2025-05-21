/**
 * Format a date string to a readable format
 * @param {string} dateString - date string in ISO format (YYYY-MM-DD)
 * @param {object} options - formatting options
 * @returns {string} formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return date.toLocaleDateString(undefined, mergedOptions);
};

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns {string} today's date
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date is today
 * @param {string} dateString - date string in ISO format (YYYY-MM-DD)
 * @returns {boolean} true if date is today
 */
export const isToday = (dateString) => {
  const today = getTodayISO();
  return dateString === today;
};

/**
 * Get a date range for a specific period
 * @param {string} period - '7days', '30days', 'thisMonth', 'lastMonth', 'thisYear'
 * @returns {object} start and end dates
 */
export const getDateRange = (period) => {
  const today = new Date();
  let startDate = new Date();
  let endDate = new Date();
  
  switch (period) {
    case '7days':
      startDate.setDate(today.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(today.getDate() - 30);
      break;
    case 'thisMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'lastMonth':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'thisYear':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      startDate.setDate(today.getDate() - 7);
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * Generate an array of dates between start and end dates
 * @param {string} startDate - start date in ISO format
 * @param {string} endDate - end date in ISO format
 * @returns {Array} array of date objects
 */
export const getDateArray = (startDate, endDate) => {
  const dateArray = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dateArray;
};

/**
 * Group entries by date
 * @param {Array} entries - array of entry objects
 * @returns {Object} entries grouped by date
 */
export const groupEntriesByDate = (entries) => {
  const grouped = {};
  
  entries.forEach(entry => {
    const date = entry.date.split('T')[0];
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    
    grouped[date].push(entry);
  });
  
  return grouped;
};