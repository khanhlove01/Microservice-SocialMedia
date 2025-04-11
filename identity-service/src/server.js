require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const routes = require('./routes/identity-service')
const errorHandler = require('./middleware/errorHandler')

const app = express();
const PORT = process.env.PORT || 3001

//connect to database
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => logger.info("Connected to DB"))
  .catch((e) => logger.error("Mongo Connection error", e));

//Connects to Redis for rate limiting.
//Uses ioredis for high performance.
const redisClient = new Redis(process.env.REDIS_URL);

//midlleware

app.use(helmet()); //adds security headers.
app.use(cors()); //allows cross-origin requests
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});
//Global rate limiter
//DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10, //Limit 10 requests per second per IP
  duration: 1,
});

//Applied globally
app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

//ip based on rate limitingh for sentsitive endpoints
// 50 requests every 15 mins
const sensitiveEndPointsLimiter = rateLimit({
    windowMs: 15*60*1000, //
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req,res) => {
      res.status(429).json({ success: false, message: "Too many requests" });
      logger.warn('Sensitive endpoint rate limit exceed for ips: '+req.ip)
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    })
})

// apply this sensitiveEndpointLimiter to routes
app.use('/api/auth/register',sensitiveEndPointsLimiter);

//routes
app.use('/api/auth',routes);

//error handler
app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`Identity Service ruuning on port ${PORT}`)
})

//unhandled promise rejection

process.on('unhandledRejection',(reason,promise) => {
    logger.error('Unhandled Rejection at', promise," reason", reason)
})