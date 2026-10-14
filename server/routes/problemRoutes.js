const express = require("express");
const router = express.Router();
const { generate, list, getById } = require("../controllers/problemController");
const { generationLimiter } = require("../middleware/rateLimiter");
const requireApiKey = require("../middleware/requireApiKey");

// POST /api/problem — generate (cache-first) or force new
router.post("/problem", requireApiKey, generationLimiter, generate);

// GET /api/problems — list all cached problems (filterable)
router.get("/problems", list);

// GET /api/problems/:id — get a single cached problem
router.get("/problems/:id", getById);

module.exports = router;
