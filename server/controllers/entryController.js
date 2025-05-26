import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Entry } from "../models/entryModel.js";

// Create a new entry
export const createEntry = catchAsyncError(async (req, res, next) => {
  const { type, amount, category, description, date } = req.body;

  if (!type || !amount || !category || !date) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const entry = await Entry.create({
    user: req.user._id,
    type,
    amount,
    category,
    description,
    date
  });

  res.status(201).json({
    success: true,
    message: "Entry created successfully",
    entry
  });
});

// Get all entries for the logged-in user
export const getEntries = catchAsyncError(async (req, res, next) => {
  const { type, startDate, endDate, category, sort, limit } = req.query;
  
  // Build query
  const query = { user: req.user._id };
  
  // Filter by type if provided
  if (type) {
    query.type = type;
  }
  
  // Filter by date range if provided
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }
  
  // Filter by category if provided
  if (category) {
    query.category = category;
  }
  
  // Build sort options
  let sortOptions = { date: -1 }; // Default: newest first
  
  if (sort) {
    const [field, order] = sort.split(':');
    sortOptions = { [field]: order === 'asc' ? 1 : -1 };
  }
  
  // Build query with limit
  let entriesQuery = Entry.find(query).sort(sortOptions);
  
  if (limit) {
    entriesQuery = entriesQuery.limit(parseInt(limit));
  }
  
  const entries = await entriesQuery;
  
  res.status(200).json({
    success: true,
    count: entries.length,
    entries
  });
});

// Get entry by ID
export const getEntry = catchAsyncError(async (req, res, next) => {
  const entry = await Entry.findById(req.params.id);
  
  if (!entry) {
    return next(new ErrorHandler("Entry not found", 404));
  }
  
  // Ensure the entry belongs to the logged-in user
  if (entry.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to access this entry", 403));
  }
  
  res.status(200).json({
    success: true,
    entry
  });
});

// Update entry
export const updateEntry = catchAsyncError(async (req, res, next) => {
  let entry = await Entry.findById(req.params.id);
  
  if (!entry) {
    return next(new ErrorHandler("Entry not found", 404));
  }
  
  // Ensure the entry belongs to the logged-in user
  if (entry.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to update this entry", 403));
  }
  
  entry = await Entry.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    message: "Entry updated successfully",
    entry
  });
});

// Delete entry
export const deleteEntry = catchAsyncError(async (req, res, next) => {
  const entry = await Entry.findById(req.params.id);
  
  if (!entry) {
    return next(new ErrorHandler("Entry not found", 404));
  }
  
  // Ensure the entry belongs to the logged-in user
  if (entry.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to delete this entry", 403));
  }
  
  await Entry.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: "Entry deleted successfully"
  });
});

// Delete all entries for the logged-in user (Clear All Financial Data)
export const deleteAllEntries = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  
  try {
    // Count entries before deletion
    const entryCount = await Entry.countDocuments({ user: userId });
    
    if (entryCount === 0) {
      return res.status(200).json({
        success: true,
        message: "No financial data found to delete",
        deletedCount: 0
      });
    }
    
    // Delete all entries for this user
    const result = await Entry.deleteMany({ user: userId });
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} financial entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all entries:', error);
    return next(new ErrorHandler("Failed to delete financial data", 500));
  }
});

// Delete entries by filter (Advanced deletion)
export const deleteEntriesByFilter = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { type, category, startDate, endDate } = req.body;
  
  // Build query
  const query = { user: userId };
  
  if (type) {
    query.type = type;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }
  
  try {
    const result = await Entry.deleteMany(query);
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting filtered entries:', error);
    return next(new ErrorHandler("Failed to delete entries", 500));
  }
});

// Get summary statistics for the logged-in user
export const getSummary = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  
  // Get today's date boundaries
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));
  
  // Get start of this week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get start of this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Aggregation for today's summary
  const todaySummary = await Entry.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfToday, $lte: endOfToday }
      }
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);
  
  // Aggregation for this week's summary
  const weekSummary = await Entry.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfWeek, $lte: endOfToday }
      }
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);
  
  // Aggregation for this month's summary
  const monthSummary = await Entry.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfMonth, $lte: endOfToday }
      }
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);
  
  // Format the results
  const formatSummary = (summary) => {
    const income = summary.find(item => item._id === "income")?.total || 0;
    const expense = summary.find(item => item._id === "expense")?.total || 0;
    const balance = income - expense;
    
    return { income, expense, balance };
  };
  
  res.status(200).json({
    success: true,
    summary: {
      today: formatSummary(todaySummary),
      thisWeek: formatSummary(weekSummary),
      thisMonth: formatSummary(monthSummary)
    }
  });
});

// Get category breakdown for analytics
export const getCategoryBreakdown = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { startDate, endDate, type } = req.query;
  
  // Build date range query
  const dateRange = {};
  if (startDate) {
    dateRange.$gte = new Date(startDate);
  }
  if (endDate) {
    dateRange.$lte = new Date(endDate);
  }
  
  // Build match condition
  const matchCondition = { user: userId };
  if (Object.keys(dateRange).length > 0) {
    matchCondition.date = dateRange;
  }
  if (type && (type === "income" || type === "expense")) {
    matchCondition.type = type;
  }
  
  // Aggregation for category breakdown
  const categoryBreakdown = await Entry.aggregate([
    {
      $match: matchCondition
    },
    {
      $group: {
        _id: { type: "$type", category: "$category" },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
  
  // Format the results
  const formattedBreakdown = categoryBreakdown.map(item => ({
    type: item._id.type,
    category: item._id.category,
    total: item.total,
    count: item.count
  }));
  
  res.status(200).json({
    success: true,
    categoryBreakdown: formattedBreakdown
  });
});

// Get daily breakdown for charts
export const getDailyBreakdown = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;
  
  // Ensure date range is provided
  if (!startDate || !endDate) {
    return next(new ErrorHandler("Please provide startDate and endDate", 400));
  }
  
  // Parse dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Aggregation for daily breakdown
  const dailyBreakdown = await Entry.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          type: "$type"
        },
        total: { $sum: "$amount" }
      }
    },
    {
      $sort: { "_id.date": 1 }
    }
  ]);
  
  // Generate a continuous date range
  const dateArray = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0];
    
    dateArray.push({
      date: dateString,
      income: 0,
      expense: 0
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Fill in the actual values
  dailyBreakdown.forEach(item => {
    const dateEntry = dateArray.find(d => d.date === item._id.date);
    if (dateEntry) {
      dateEntry[item._id.type] = item.total;
    }
  });
  
  // Calculate balance for each day
  dateArray.forEach(day => {
    day.balance = day.income - day.expense;
  });
  
  res.status(200).json({
    success: true,
    dailyBreakdown: dateArray
  });
});

// Get financial insights and analytics
export const getFinancialInsights = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { period = '30days' } = req.query;
  
  // Calculate date range based on period
  const today = new Date();
  let startDate = new Date();
  
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
      const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    default:
      startDate.setDate(today.getDate() - 30);
  }
  
  // Get comprehensive analytics
  const analytics = await Entry.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: today }
      }
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
        maxAmount: { $max: "$amount" },
        minAmount: { $min: "$amount" }
      }
    }
  ]);
  
  // Calculate insights
  const income = analytics.find(a => a._id === 'income') || { total: 0, count: 0, avgAmount: 0 };
  const expense = analytics.find(a => a._id === 'expense') || { total: 0, count: 0, avgAmount: 0 };
  
  const savingsRate = income.total > 0 ? ((income.total - expense.total) / income.total) * 100 : 0;
  const balance = income.total - expense.total;
  const avgDailyExpense = expense.total / (period === '7days' ? 7 : 30);
  const avgDailyIncome = income.total / (period === '7days' ? 7 : 30);
  
  // Generate insights
  const insights = [];
  
  if (savingsRate > 20) {
    insights.push({
      type: 'positive',
      title: 'Excellent Savings!',
      message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`
    });
  } else if (savingsRate > 10) {
    insights.push({
      type: 'neutral',
      title: 'Good Savings Habit',
      message: `You're saving ${savingsRate.toFixed(1)}%. Try to reach 20% for better financial health.`
    });
  } else if (savingsRate <= 0) {
    insights.push({
      type: 'warning',
      title: 'Spending Alert',
      message: 'You\'re spending more than you earn. Consider budgeting.'
    });
  }
  
  res.status(200).json({
    success: true,
    insights: {
      period,
      totalIncome: income.total,
      totalExpense: expense.total,
      balance,
      savingsRate,
      avgDailyIncome,
      avgDailyExpense,
      transactionCount: income.count + expense.count,
      insights
    }
  });
});

// Get spending patterns
export const getSpendingPatterns = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { months = 3 } = req.query;
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const patterns = await Entry.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          year: { $year: "$date" },
          category: "$category"
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1, "total": -1 }
    }
  ]);
  
  res.status(200).json({
    success: true,
    patterns
  });
});