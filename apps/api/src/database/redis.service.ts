import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null;

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>("REDIS_URL");
    if (!redisUrl) {
      this.client = null;
      return;
    }

    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      tls: redisUrl.startsWith("rediss://") ? {} : undefined
    });

    void this.client.connect().catch(() => {
      this.logger.warn("Redis connection failed. Continuing without cache.");
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async getJson<T>(key: string) {
    if (!this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds = 300) {
    if (!this.client) {
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      this.logger.warn(`Failed to cache key ${key}.`);
    }
  }

  async invalidateByPrefix(prefix: string) {
    if (!this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch {
      this.logger.warn(`Failed to invalidate cache for prefix ${prefix}.`);
    }
  }

  async ping() {
    if (!this.client) {
      return {
        connected: false,
        provider: "disabled"
      };
    }

    try {
      const result = await this.client.ping();
      return {
        connected: result === "PONG",
        provider: "redis"
      };
    } catch {
      return {
        connected: false,
        provider: "redis"
      };
    }
  }
}
