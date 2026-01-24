const { v4: uuidv4 } = require('uuid');
const User = require("../models/user")
const {setUser,getUser} = require("../service/auth")

async function handleUserSignup(req,res) {
    try {
        const {name , email , password} = req.body;
        const user = await User.create({
            name,
            email,
            password,
        });
        const token = setUser(user);
        return res.status(200).json({ 
            token, 
            user: { _id: user._id, name: user.name, email: user.email } 
        });
    } catch (error) {
        return res.status(400).json({ error: error.message || "Signup failed" });
    }
}

async function handleUserLogin(req,res) {
    try {
        const { email , password} = req.body;
        const user = await User.findOne({
            email,
            password,
        });
        if(!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const token = setUser(user);
        return res.status(200).json({ 
            token, 
            user: { _id: user._id, name: user.name, email: user.email } 
        });
    } catch (error) {
        return res.status(500).json({ error: "Login failed" });
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin
}