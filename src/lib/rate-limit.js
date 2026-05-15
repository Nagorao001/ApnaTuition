const limitMap = new Map();

// 5 requests per minute
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000;

export function rateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Clean up old entries to prevent memory leaks in long-running processes
  // Note: On Vercel, this map resets on cold start anyway.
  if (Math.random() < 0.1) {
    for (const [key, value] of limitMap.entries()) {
      if (value.timestamp < windowStart) {
        limitMap.delete(key);
      }
    }
  }

  const record = limitMap.get(ip);
  if (!record || record.timestamp < windowStart) {
    limitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  return true;
}
