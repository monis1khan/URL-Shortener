const redisClient = require("../clients/redis");

const RANGE_SIZE = 1000;
const REDIS_KEY = "global_id_counter";

let currentId = 0;
let maxId = 0;
let refillPromise = null; // The "Traffic Light"

async function getUniqueId() {
    // 1. Check if we need to refill
    if (currentId >= maxId || refillPromise) {
        
        // If no one is refilling yet, start the refill
        if (!refillPromise) {
            // We return the promise so we can catch errors later
            refillPromise = redisClient.incrBy(REDIS_KEY, RANGE_SIZE)
                .then((newMax) => {
                    maxId = newMax;
                    currentId = newMax - RANGE_SIZE;
                    // Note: We don't reset refillPromise here anymore
                })
                .catch((err) => {
                    console.error("Redis Refill Failed:", err);
                    throw err; // Stop everything if Redis is dead
                })
                .finally(() => {
                    // SAFETY VALVE: Always unlock, even if it crashes!
                    refillPromise = null; 
                });
        }

        // Everyone waits here
        try {
            await refillPromise;
        } catch (error) {
            // If the refill failed, we can't give an ID.
            throw new Error("Failed to generate ID"); 
        }
    }

    // 2. Guaranteed to have stock now
    currentId++;
    return currentId;
}

module.exports = { getUniqueId };