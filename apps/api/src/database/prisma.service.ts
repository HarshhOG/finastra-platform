import { Injectable, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { createPrismaClientOptions } from "./prisma-client-options";

export { Prisma };

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super(createPrismaClientOptions());
  }

  async onModuleInit() {
    await this.$connect();
  }
}
