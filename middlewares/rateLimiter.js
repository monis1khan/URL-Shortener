const { RateLimiterRedis } = require('rate-limiter-flexible');
// 1. Import Redis directly (Assuming you use 'ioredis' or 'redis')
// If you use 'redis' package, change this line to: const Redis = require('redis');
const Redis = require('ioredis'); 

// 2. Create a PRIVATE connection just for this middleware
// This prevents conflicts with your other Redis code.
const rateLimiterClient = new Redis({
  host: 'redis_stack', // Matches your docker-compose service name
  port: 6379,
  enableOfflineQueue: false, // 🚀 CRITICAL: This fixes the "is not a function" crash
});

const rateLimiter = new RateLimiterRedis({
  storeClient: rateLimiterClient,
  keyPrefix: 'middleware_final',
  points: 10,
  duration: 60,
});

const rateLimiterMiddleware = (req, res, next) => {
  const key = req.user ? req.user._id.toString() : (req.headers['x-forwarded-for'] || req.socket.remoteAddress);

  rateLimiter.consume(key)
    .then(() => {
      next();
    })
    .catch((rateLimiterRes) => {
      // If it's a real block (points consumed), send 429
      // If it's a crash (rateLimiterRes is an Error), we should probably let it pass or log it
      if (rateLimiterRes instanceof Error) {
        console.log("⚠️ Rate Limiter Redis Error:", rateLimiterRes);
        next(); // FAIL OPEN: If Redis breaks, don't block users!
      } else {
        res.status(429).json({ 
          error: "Too Many Requests. Please try again later." 
        });
      }
    });
};

module.exports = rateLimiterMiddleware;