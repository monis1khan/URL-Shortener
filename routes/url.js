const express = require("express");
const { 
    handleGenerateNewShortURL, 
    handleGetAnalytics, 
    handleRedirectUser // 1. Import the new redirect function
} = require("../controllers/url");

// 2. Import Auth Middleware 
// (Make sure this path matches where your auth.js file is!)
const { restrictToLoggedinUserOnly } = require("../middlewares/auth");

const router = express.Router();

// --- PUBLIC ROUTE ---
// Anyone can visit this (no login required)
router.get("/:shortId", handleRedirectUser);

// --- PROTECTED ROUTES ---
// User must be logged in to create URLs or view analytics
// We pass the middleware as the second argument here
router.post("/", restrictToLoggedinUserOnly, handleGenerateNewShortURL);

router.get("/analytics/:shortId", restrictToLoggedinUserOnly, handleGetAnalytics);

module.exports = router;