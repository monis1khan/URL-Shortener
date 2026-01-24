const express = require("express");
const User = require("../models/user")
const {handleUserSignup, handleUserLogin} = require("../controllers/user")
const router = express.Router();

router.post("/signup",handleUserSignup)
router.post("/login",handleUserLogin)



module.exports = router;