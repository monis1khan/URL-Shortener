const{getUser} = require("../services/auth")

async function restrictToLoggedinUserOnly(req,res,next) {
   // Extract Bearer token from Authorization header
   const authHeader = req.headers.authorization;
   if(!authHeader || !authHeader.startsWith("Bearer ")) {
       return res.status(401).json({ error: "Unauthorized: No token provided" });
   }
   
   const token = authHeader.substring(7); // Remove "Bearer " prefix
   const user = await getUser(token);
   if(!user) {
       return res.status(401).json({ error: "Unauthorized: Invalid token" });
   }

   req.user = user;
   next();
}

async function checkAuth(req,res,next) {
   // Extract Bearer token from Authorization header (optional for this middleware)
   const authHeader = req.headers.authorization;
   const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
   const user = await getUser(token);
   
   req.user = user;
   next();
}

module.exports ={
    restrictToLoggedinUserOnly,
    checkAuth
}