import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 15; // 15 requests per minute

// In-memory store for rate limiting per client IP
const requestCounts = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  // Extract client IP address safely
  const clientIp = (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'anonymous'
  );

  const now = Date.now();
  const clientRecord = requestCounts.get(clientIp);

  if (!clientRecord || now > clientRecord.resetTime) {
    // Start a new window
    requestCounts.set(clientIp, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
    res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS_PER_WINDOW - 1);
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + WINDOW_MS) / 1000));
    return next();
  }

  if (clientRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((clientRecord.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientRecord.resetTime / 1000));
    res.setHeader('Retry-After', retryAfterSeconds);

    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment and try again.',
      retryAfter: retryAfterSeconds,
    });
    return;
  }

  // Increment request count
  clientRecord.count += 1;
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS_PER_WINDOW - clientRecord.count);
  res.setHeader('X-RateLimit-Reset', Math.ceil(clientRecord.resetTime / 1000));

  next();
}
