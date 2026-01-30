const express = require("express");
const {connectMongoDB} = require("./connect");
const cors = require("cors");

const app = express();
const PORT = 8001;


//Routes

const urlRoute = require("./routes/url");
const userRoute = require("./routes/user")

//connection of mongoDB
connectMongoDB("mongodb://127.0.0.1:27017/short-url")
.then(()=>console.log("MongoDB connected"))

//middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}))



app.use("/api/url", urlRoute);
app.use("/api/user", userRoute);

// Public redirect route - keep this for backward compatibility
const { handleRedirectUser} = require("./controllers/url");
app.get("/:shortId", handleRedirectUser);

app.listen(PORT,()=>console.log(`Server Started at PORT:${PORT}`));