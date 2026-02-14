require("dotenv").config();
const URL = require("../models/url");
const Analytics = require("../models/analytics"); // <--- IMPORT THE NEW MODEL
const redisClient = require("../clients/redis"); 
const { getUniqueId } = require("../services/tokenService");
const Hashids = require('hashids/cjs');

// CONFIGURATION:
const hashids = new Hashids(process.env.HASH_SALT, 3);

async function handleGenerateNewShortURL(req, res) {
    try {
        const body = req.body;
        if (!body.url) return res.status(400).json({ error: "url is required" });

        // 1. Get Unique ID
        const uniqueNumber = await getUniqueId();
        const shortID = hashids.encode(uniqueNumber);

        // 2. Save to MongoDB (Summary Only)
        // NOTICE: No visitHistory array here!
        await URL.create({
            shortId: shortID,
            redirectURL: body.url,
            totalClicks: 0, // <--- We start at 0
            createdBy: req.user._id, 
        });

        return res.status(201).json({ id: shortID });
    } catch (error) {
        console.error("Error generating URL:", error);
        return res.status(500).json({ error: "Server Error" });
    }
}

async function handleRedirectUser(req, res) {
    const shortId = req.params.shortId;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    try {
        // ===============================================
        // 1. REDIS CACHE HIT (Fast Path)
        // ===============================================
        const cacheUrl = await redisClient.get(`url:${shortId}`);

        if (cacheUrl) {
          
            await URL.updateOne(
                { shortId }, 
                { $inc: { totalClicks: 1 } }
            );

            // Create Analytics in the background 
            Analytics.create({
                shortId,
                userAgent,
                ipAddress,
            }).catch(err => console.log("Analytics Log Error:", err));
            
            // NOW we redirect
            return res.redirect(cacheUrl);
        }

       
        // 2. DATABASE HIT (Slow Path)
        
        const entry = await URL.findOne({ shortId });

        if (!entry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        // CRITICAL FIX: Increment the counter here too
        await URL.updateOne(
            { shortId }, 
            { $inc: { totalClicks: 1 } }
        );

        // Save to Redis for next time (expires in 24 hours)
        await redisClient.set(`url:${shortId}`, entry.redirectURL, { EX: 86400 });

        // Create Analytics in the background
        Analytics.create({
            shortId,
            userAgent,
            ipAddress,
        }).catch(err => console.log("Analytics Log Error:", err));

        // Redirect
        return res.redirect(entry.redirectURL);

    } catch (error) {
        console.error("Error in redirect:", error);
        return res.status(500).json({ error: "Server Error" });
    }
}

async function handleGetAnalytics(req, res) {
    try {
        const shortId = req.params.shortId;

        // 1. Get the Total Count (Fast)
        const urlDoc = await URL.findOne({ shortId });
        if (!urlDoc) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        // 2. Get the Recent Logs (Last 50)
        const recentHistory = await Analytics.find({ shortId })
            .sort({ timestamp: -1 })
            .limit(50);

        return res.json({
            totalClicks: urlDoc.totalClicks, // <--- This is the number your Frontend needs
            analytics: recentHistory,
        });
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
}

async function handleGetMyURLs(req, res) {
    try {
        if (!req.user || !req.user._id) return res.status(401).json({ error: 'Unauthorized' });

        const urls = await URL.find({ createdBy: req.user._id });
        return res.json(urls);
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
}

async function handleDeleteURL(req, res) {
    try {
        const id = req.params.id;
        
        // 1. Delete URL
        const result = await URL.findOneAndDelete({ 
            _id: id, 
            createdBy: req.user._id 
        });

        if (!result) {
            return res.status(404).json({ error: "URL not found or unauthorized" });
        }
        
        // 2. Clear Cache
        await redisClient.del(`url:${result.shortId}`);

        // 3. Clear Logs (Optional but clean)
        await Analytics.deleteMany({ shortId: result.shortId });
        
        return res.json({ status: "success", message: "URL deleted" });
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
}

module.exports = {
    handleGenerateNewShortURL,
    handleGetAnalytics,
    handleRedirectUser,
    handleGetMyURLs,
    handleDeleteURL,
};