const express = require("express");
const { 
    handleGenerateNewShortURL, 
    handleGetAnalytics, 
    handleGetMyURLs,
    handleDeleteURL
} = require("../controllers/url");

// 2. Import Auth Middleware 
// (Make sure this path matches where your auth.js file is!)
const { restrictToLoggedinUserOnly } = require("../middlewares/auth");
const rateLimiter = require("../middlewares/rateLimiter");

const router = express.Router();

// --- PUBLIC ROUTE ---
// Anyone can visit this (no login required)router.get("/:shortId", handleRedirectUser);

// --- PROTECTED ROUTES ---
// User must be logged in to create URLs or view analytics
// We pass the middleware as the second argument here
router.post("/", restrictToLoggedinUserOnly,rateLimiter, handleGenerateNewShortURL);

router.get("/analytics/:shortId", restrictToLoggedinUserOnly, handleGetAnalytics);

router.get("/history", restrictToLoggedinUserOnly, handleGetMyURLs);

router.delete("/:id", restrictToLoggedinUserOnly, handleDeleteURL);


module.exports = router;