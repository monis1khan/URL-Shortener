require('dotenv').config();
const express = require("express");
const {connectMongoDB} = require("./connect");
const cors = require("cors");

const app = express();
const PORT = 8001;


//Routes

const urlRoute = require("./routes/url");
const userRoute = require("./routes/user")

//connection of mongoDB
connectMongoDB(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB Error:", err));

//middlewares
app.use(cors({
    // 1. We allow both Docker (port 80) and Local Dev (port 5173)
    origin: ["http://localhost", "http://localhost:5173"],
    
    // 2. REQUIRED for JWT: Allows cookies and authorization headers
    credentials: true,

    // 3. Optional but good: Allow specific methods
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}))



app.use("/api/url", urlRoute);
app.use("/api/user", userRoute);

// Public redirect route - keep this for backward compatibility
const { handleRedirectUser} = require("./controllers/url");
app.get("/:shortId", handleRedirectUser);

app.listen(PORT,()=>console.log(`Server Started at PORT:${PORT}`));