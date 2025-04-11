Redis is used for two main functionalities, both related to rate limiting — one custom and flexible, and one middleware-based.

1. RateLimiterRedis (from rate-limiter-flexible)
Purpose:
Limits each IP to 10 requests per second

If a client exceeds that, it gets a 429 "Too many requests" error

Uses Redis to store rate-limiting data across multiple service instances

Why Redis?
Without Redis, rate limits would only apply per instance (in-memory).

With Redis, you can share limits across:

multiple servers (horizontal scaling),

multiple containers in Docker/K8s

Redis acts as a shared store for counters like: middleware:192.168.1.25 → { points: 3, ttl: 0.5s }

2. RedisStore (used in express-rate-limit)

Purpose:
Used for sensitive endpoints like /api/auth/register

Limits 50 requests per 15 minutes per IP

Stores those counters in Redis using express-rate-limit's RedisStore adapter

Why Redis?
Same idea: Redis allows this middleware to work in distributed systems

Instead of tracking IPs per-instance, all app instances share the same Redis store