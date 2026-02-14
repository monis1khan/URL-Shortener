require('dotenv').config();
// service/auth.js
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

function setUser(user) {
  // pick only necessary fields
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    secret
  );
}

function getUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
}

module.exports = {
  setUser,
  getUser,
};
