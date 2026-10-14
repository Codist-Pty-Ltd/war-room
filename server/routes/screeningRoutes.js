const express = require("express");
const router = express.Router();
const {
  generate,
  list,
  getById,
} = require("../controllers/screeningController");
const { generationLimiter } = require("../middleware/rateLimiter");
const requireApiKey = require("../middleware/requireApiKey");

// POST /api/screening — generate (cache-first) or force new
router.post("/screening", requireApiKey, generationLimiter, generate);

// GET /api/screenings — list all cached screening questions
router.get("/screenings", list);

// GET /api/screenings/:id — get a single screening question
router.get("/screenings/:id", getById);

module.exports = router;
