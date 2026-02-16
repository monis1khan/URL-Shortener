require('dotenv').config();
const express = require("express");
const { connectMongoDB } = require("./connect");
const cors = require("cors");

// 1. IMPORT KAFKA PRODUCER (Make sure path is correct!)
const { producer } = require("./kafka"); 

const app = express();
const PORT = 8001;

//Routes
const urlRoute = require("./routes/url");
const userRoute = require("./routes/user");

//middlewares
app.use(cors({
    origin: ["http://localhost", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api/url", urlRoute);
app.use("/api/user", userRoute);

// Public redirect route
const { handleRedirectUser } = require("./controllers/url");
app.get("/:shortId", handleRedirectUser);



//  STARTUP SEQUENCE (Database + Kafka + Server)

async function init() {
  try {
    // 1. Connect MongoDB
    await connectMongoDB(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");

    // 2. Connect Kafka (CRITICAL STEP)
    await producer.connect();
    console.log("✅ Kafka Producer Connected");

    // 3. Start Server
    app.listen(PORT, () => console.log(`🚀 Server Started at PORT:${PORT}`));

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // Stop the process if DB or Kafka fails
  }
}

init();