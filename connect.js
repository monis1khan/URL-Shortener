const mongoose = require("mongoose");

//connection
async function connectMongoDB(url) {
    return mongoose.connect(url)
};

module.exports = {connectMongoDB}