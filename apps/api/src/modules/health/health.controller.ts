import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { RedisService } from "../../database/redis.service";
import { Public } from "../../common/decorators/public.decorator";

@Public()
@Controller("healthz")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  @Get()
  async check() {
    const [database, cache] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      this.redis.ping()
    ]);

    return {
      ok: database,
      services: {
        database,
        cache
      },
      timestamp: new Date().toISOString()
    };
  }
}
