import { Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "../../database/prisma.service";

function toJsonValue(value: Record<string, unknown> | undefined) {
  if (!value) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

interface AuditPayload {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(payload: AuditPayload) {
    return this.prisma.auditLog.create({
      data: {
        actorId: payload.actorId ?? null,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId ?? null,
        ipAddress: payload.ipAddress ?? null,
        metadata: toJsonValue(payload.metadata)
      }
    });
  }
}
