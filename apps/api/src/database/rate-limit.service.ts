import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly ratelimit: Ratelimit | null;

  constructor(configService: ConfigService) {
    const url = configService.get<string>("UPSTASH_REDIS_REST_URL");
    const token = configService.get<string>("UPSTASH_REDIS_REST_TOKEN");

    this.ratelimit =
      url && token
        ? new Ratelimit({
            redis: new Redis({ url, token }),
            limiter: Ratelimit.slidingWindow(10, "10 m")
          })
        : null;
  }

  async consume(key: string) {
    if (!this.ratelimit) {
      return {
        success: true,
        limit: null,
        remaining: null
      };
    }

    try {
      return await this.ratelimit.limit(key);
    } catch (error) {
      this.logger.warn(
        `Upstash rate limit check failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return {
        success: true,
        limit: null,
        remaining: null
      };
    }
  }
}
