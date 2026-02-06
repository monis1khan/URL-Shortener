const redisClient = require("../clients/redis");
const { nanoid } = require("nanoid");
const URL = require("../models/url");

async function handleGenerateNewShortURL(req, res) {
  const body = req.body;
  if (!body.url) return res.status(400).json({ error: "url is required" });

  const shortID = nanoid(8);
  
  await URL.create({
    shortId: shortID,
    redirectURL: body.url,
    visitHistory: [],
    // Ensure your auth middleware is populating req.user!
    createdBy: req.user._id, 
  });

  // CHANGE: Return JSON instead of rendering a view
  return res.status(201).json({ id: shortID });
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  
  if (!result) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

// NEW: Add this function to handle the public redirect
async function handleRedirectUser(req, res) {
  const shortId = req.params.shortId;
  
  // we check data in redis 
  const cacheUrl = await redisClient.get(`url:${shortId}`);
  if(cacheUrl) {
    res.redirect(cacheUrl);
  
  URL.findOneAndUpdate(
    {shortId},
    {$push: {visitHistory: {timestamp: Date.now()}}}
    ).catch((err)=>console.log("Error updating analytics",err));
    return ;
  }

  // if data is not in redis 
  const entry = await URL.findOneAndUpdate(
    { shortId },
    { $push: { visitHistory: { timestamp: Date.now() } } }
  );

  if (!entry) {
    return res.status(404).json({ error: "Short URL not found" });
  }
  await redisClient.set(`url:${shortId}`, entry.redirectURL);
  res.redirect(entry.redirectURL);
}

async function handleGetMyURLs(req, res) {
 
  if (!req.user || !req.user._id) return res.status(401).json({ error: 'Unauthorized' });


  const urls = await URL.find({ createdBy: req.user._id });

  
  return res.json(urls);
}

async function handleDeleteURL(req, res) {
  const id = req.params.id;
  
  // We search by ID *and* createdBy to ensure users can only delete their own links
  const result = await URL.findOneAndDelete({ 
    _id: id, 
    createdBy: req.user._id 
  });

  if (!result) {
    return res.status(404).json({ error: "URL not found or unauthorized" });
  }
  await redisClient.del(`url:${result.shortId}`);
  return res.json({ status: "success", message: "URL deleted" });
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleRedirectUser, 
  handleGetMyURLs,
  handleDeleteURL,

};