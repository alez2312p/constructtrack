import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRatelimiter() {
  const redisUrl = process.env.UPSTASH_REDIS_URL;
  const redisToken = process.env.UPSTASH_REDIS_TOKEN;

  if (!redisUrl || !redisToken) {
    if (typeof console !== "undefined") {
      console.warn(
        "⚠️  UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN not set. Rate limiting disabled.",
      );
    }
    return null;
  }

  const redis = new Redis({ url: redisUrl, token: redisToken });

  return {
    login: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "ct:login",
    }),
    mutation: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "ct:mutation",
    }),
    general: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ct:general",
    }),
  };
}

export const rateLimit = createRatelimiter();
