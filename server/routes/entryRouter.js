import express from "express";
import {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  getSummary,
  getCategoryBreakdown,
  getDailyBreakdown,
  deleteAllEntries,
  deleteEntriesByFilter
} from "../controllers/entryController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected with authentication
router.use(isAuthenticated);

// Basic CRUD operations
router.post("/", createEntry);
router.get("/", getEntries);
router.get("/summary", getSummary);
router.get("/category-breakdown", getCategoryBreakdown);
router.get("/daily-breakdown", getDailyBreakdown);
router.get("/:id", getEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

// Bulk delete operations
router.delete("/all/entries", deleteAllEntries);  // Clear all financial data
router.post("/delete-filtered", deleteEntriesByFilter);  // Delete by filter

export default router;