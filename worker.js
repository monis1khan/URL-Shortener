const { consumer } = require('./kafka'); 
const mongoose = require('mongoose');
const URL = require('./models/url'); 
const Analytics = require('./models/analytics'); 

async function startWorker() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Worker Connected to MongoDB");

    // 2. Connect to Kafka (Using the smart retry function below)
    await connectKafka(); 

    // 3. Start Processing Messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        console.log(`Processing Click for: ${data.shortId}`);
        
        // A. Log to Analytics Collection
        await Analytics.create({
            shortId: data.shortId,
            userAgent: data.userAgent,
            ipAddress: data.ipAddress,
            timestamp: new Date(data.timestamp) // Ensure date format
        });

        // B. Update Total Clicks Counter
        await URL.updateOne(
          { shortId: data.shortId },
          { $inc: { totalClicks: 1 } }
        );
      },
    });

  } catch (error) {
    console.error("❌ Worker Crashed:", error);
  }
}

// --- NEW: RETRY LOGIC (The "Invincible" Part) ---
async function connectKafka() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'url-clicks', fromBeginning: true });
    console.log("✅ Worker Listening for Kafka Messages...");
  } catch (err) {
    console.log("⚠️ Kafka not ready... Worker retrying in 5 seconds...");
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    // Try again (Recursion)
    return connectKafka(); 
  }
}

startWorker();