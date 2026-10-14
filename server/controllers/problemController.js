const Problem = require("../models/Problem");
const { getAnthropicModel } = require("../config/anthropic");
const { getPlatformGuideEntry } = require("../constants/platformGuides");
const { getCategoryGuideAddition } = require("../constants/categoryGuides");
const { parseClaudeJson } = require("../utils/parseClaudeJson");
const { getCachedProblem, cacheProblem } = require("../services/problemCache");

function buildProblemCacheKey(platform, language, category, difficulty) {
  return `${platform}:${language}:${category}:${difficulty}`.toLowerCase();
}

const JSON_SCHEMA_BLOCK = `You MUST respond with ONLY a valid JSON object — no markdown, no backticks, no text outside JSON.

JSON structure:
{
  "title": "Problem title (use platform's naming convention)",
  "difficulty": "Easy|Medium|Hard",
  "platformNotes": "How this platform specifically scores/evaluates this type of problem. Include platform-specific tags, kyu ranks, scoring percentages, or related topics as appropriate.",
  "description": "Full problem statement formatted EXACTLY as this platform presents problems — match their section structure, tone, input/output format, and example style.",
  "constraints": ["constraint 1 in platform's notation style", "constraint 2"],
  "realWorldContext": "Where a real dev would encounter this",
  "ideSetup": ["Step 1", "Step 2", "Step 3"],
  "thinkingProcess": ["Question 1", "Question 2", "Question 3", "Question 4"],
  "steps": [
    { "step": 1, "title": "Step title", "explanation": "Why we do this", "code": "// code matching platform's solution format (function vs class vs stdin)" },
    { "step": 2, "title": "Step title", "explanation": "...", "code": "// code" },
    { "step": 3, "title": "Step title", "explanation": "...", "code": "// code" },
    { "step": 4, "title": "Wire up and test", "explanation": "...", "code": "// full runnable code" }
  ],
  "fullSolution": "// Complete solution matching platform's expected format",
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "complexity": { "time": "O(?) — plain English", "space": "O(?) — plain English" },
  "seniorTip": "One golden insight",
  "hints": ["Vague nudge", "More specific", "Almost gives it away"]
}`;

function buildSystemPrompt(guide) {
  const base = `You are a senior engineer and technical interview coach generating authentic platform-specific coding problems.

CRITICAL: Each platform has a DISTINCT format, tone, naming convention, and problem structure. You MUST match the platform's actual style — not generic LeetCode-style for everything.

${guide.scoringNotes ? `Platform scoring context:\n${guide.scoringNotes}\n\n` : ""}${JSON_SCHEMA_BLOCK}`;
  return base;
}

function buildUserPrompt(
  platformName,
  platformFocus,
  language,
  category,
  difficulty,
  guide,
) {
  const categoryExtra = getCategoryGuideAddition(platformName, category);
  const lines = [
    `Platform: ${platformName}`,
    `Language: ${language}`,
    `Category: ${category}`,
    `Difficulty: ${difficulty}`,
    `Platform context: ${platformFocus || ""}`,
  ];
  if (guide.promptInjection) {
    lines.push("", "Platform requirements:", guide.promptInjection);
  }
  if (categoryExtra) {
    lines.push("", "Category-specific requirements:", categoryExtra);
  }
  if (guide.timeFormat) {
    lines.push("", `Code format: ${guide.timeFormat}`);
  }
  if (guide.exampleStructure) {
    lines.push("", "Expected code structure:", guide.exampleStructure);
  }
  lines.push(
    "",
    `Generate a ${difficulty} ${category} problem in ${language} that authentically mirrors what appears on ${platformName}. Follow the platform requirements and JSON schema exactly. A candidate who uses ${platformName} daily should feel like this came from the real platform.`,
    "Return ONLY JSON.",
  );
  return lines.join("\n");
}

async function generate(req, res, next) {
  try {
    const {
      platform,
      platformFocus,
      language,
      category,
      difficulty,
      forceNew,
    } = req.body;

    if (!platform || !language || !category || !difficulty) {
      const err = new Error(
        "Missing required fields: platform, language, category, difficulty",
      );
      err.status = 400;
      throw err;
    }

    // Cache-first: check if we already have a problem for this combo
    const cacheKey = buildProblemCacheKey(platform, language, category, difficulty);
    if (!forceNew) {
      const cached = Problem.findCached(
        platform,
        language,
        category,
        difficulty,
      );
      if (cached) {
        console.log(
          `Cache HIT: ${platform}/${language}/${category}/${difficulty}`,
        );
        return res.json({
          problem: JSON.parse(cached.response_json),
          cached: true,
          id: cached.id,
        });
      }

      const redisCached = await getCachedProblem(cacheKey);
      if (redisCached) {
        console.log(`Redis cache HIT: ${cacheKey}`);
        return res.json({ problem: redisCached, cached: true, id: null });
      }
    }

    console.log(
      `Cache MISS: ${platform}/${language}/${category}/${difficulty} — calling Claude`,
    );

    // Call Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const err = new Error("ANTHROPIC_API_KEY not configured");
      err.status = 500;
      throw err;
    }

    const guide = getPlatformGuideEntry(platform);

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: getAnthropicModel(),
        max_tokens: 4000,
        system: buildSystemPrompt(guide),
        messages: [
          {
            role: "user",
            content: buildUserPrompt(
              platform,
              platformFocus || "",
              language,
              category,
              difficulty,
              guide,
            ),
          },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const body = await claudeRes.text();
      console.error("Claude API error:", claudeRes.status, body);
      const err = new Error(`Claude API returned ${claudeRes.status}`);
      err.status = 502;
      throw err;
    }

    const claudeData = await claudeRes.json();
    const text =
      claudeData.content?.find((b) => b.type === "text")?.text ??
      claudeData.content?.[0]?.text ??
      "";

    const problem = parseClaudeJson(text, "problem");

    // Save to cache
    const id = Problem.save(
      platform,
      language,
      category,
      difficulty,
      problem,
      problem.title,
    );
    await cacheProblem(cacheKey, problem);
    console.log(`Saved problem #${id}: "${problem.title}"`);

    res.json({ problem, cached: false, id });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { platform, language, category, difficulty, limit, offset } =
      req.query;
    const result = Problem.findAll({
      platform,
      language,
      category,
      difficulty,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      const err = new Error("Invalid problem ID");
      err.status = 400;
      throw err;
    }

    const row = Problem.findById(id);
    if (!row) {
      const err = new Error("Problem not found");
      err.status = 404;
      throw err;
    }

    res.json({
      ...row,
      response_json: JSON.parse(row.response_json),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, list, getById };
