require("dotenv").config();
const URL = require("../models/url");
const Analytics = require("../models/analytics"); 
const redisClient = require("../clients/redis"); 
const { getUniqueId } = require("../services/tokenService");
const Hashids = require('hashids/cjs');
const { producer } = require('../kafka'); 

const hashids = new Hashids(process.env.HASH_SALT, 3);

async function handleGenerateNewShortURL(req, res) {
    try {
        const body = req.body;
        
        if (!body.url) return res.status(400).json({ error: "url is required" });
        let originalURL = body.url;
        if (!originalURL.startsWith("http://") && !originalURL.startsWith("https://")) {
            originalURL = "https://" + originalURL;
        }

        // 1. Get Unique ID
        const uniqueNumber = await getUniqueId();
        const shortID = hashids.encode(uniqueNumber);

        // 2. Save to MongoDB
        await URL.create({
            shortId: shortID,
            redirectURL: body.url,
            totalClicks: 0, 
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
        let redirectURL = await redisClient.get(`url:${shortId}`);

        if (redirectURL) {
            // KAFKA: Send the event and Redirect immediately!
            // We do NOT wait for DB updates here.
            sendAnalyticsToKafka(shortId, userAgent, ipAddress);
            return res.redirect(redirectURL);
        }

        // ===============================================
        // 2. DATABASE HIT (Slow Path)
        // ===============================================
        const entry = await URL.findOne({ shortId });

        if (!entry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        redirectURL = entry.redirectURL;

        // Save to Redis for next time
        await redisClient.set(`url:${shortId}`, redirectURL, { EX: 86400 });

        // KAFKA: Send the event
        sendAnalyticsToKafka(shortId, userAgent, ipAddress);

        // Redirect
        return res.redirect(redirectURL);

    } catch (error) {
        console.error("Error in redirect:", error);
        return res.status(500).json({ error: "Server Error" });
    }
}

// --- HELPER FUNCTION TO SEND TO KAFKA ---
async function sendAnalyticsToKafka(shortId, userAgent, ipAddress) {
    try {
        const payload = {
            shortId,
            userAgent,
            ipAddress,
            timestamp: Date.now()
        };

        // This is non-blocking (we don't await the result strictly if we want max speed)
        await producer.send({
            topic: 'url-clicks',
            messages: [ { value: JSON.stringify(payload) } ],
        });
        
    } catch (err) {
        console.error("Kafka Produce Error:", err);
    }
}

async function handleGetAnalytics(req, res) {
    try {
        const shortId = req.params.shortId;

        // 1. Get the Total Count
        const urlDoc = await URL.findOne({ shortId });
        if (!urlDoc) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        // 2. Get the Recent Logs
        const recentHistory = await Analytics.find({ shortId })
            .sort({ timestamp: -1 })
            .limit(50);

        return res.json({
            totalClicks: urlDoc.totalClicks,
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
        
        const result = await URL.findOneAndDelete({ 
            _id: id, 
            createdBy: req.user._id 
        });

        if (!result) {
            return res.status(404).json({ error: "URL not found or unauthorized" });
        }
        
        await redisClient.del(`url:${result.shortId}`);
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