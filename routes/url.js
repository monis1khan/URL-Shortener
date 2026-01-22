const express = require("express")
const URL = require("../models/url");
const {handleGenerateNewShortURL,handleGetAnalytics} = require("../controllers/url")
const router = express.Router();


// Redirect route
router.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    { shortId },
    { $push: { visitHistory: { timestamp: Date.now() } } }
  );

  if (!entry) {
    return res.status(404).send("Short URL not found");
  }

  res.redirect(entry.redirectURL);
});



router.post("/",handleGenerateNewShortURL)

router.get("/analytics/:shortId", handleGetAnalytics)

module.exports = router;