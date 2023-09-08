import { Redis } from "@upstash/redis";

// export const db = new Redis({
//   url: "UPSTASH_REDIS_REST_URL",
//   token: "UPSTASH_REDIS_REST_TOKEN",
// });

export const db = Redis.fromEnv();
