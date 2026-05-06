import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ApprovalStatus, ChangeAction, Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { RedisService } from "../../database/redis.service";
import { buildDiff } from "../../common/utils/diff.util";
import { sanitizeText } from "../../common/utils/sanitize.util";
import { AuditService } from "../audit/audit.service";
import { UpsertEventDto } from "./dto/upsert-event.dto";

type AuthUser = {
  id: string;
  role: string;
};

const adminEventInclude = {
  adminAssignments: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  },
  sections: { orderBy: { sortOrder: "asc" as const } },
  rules: { orderBy: { sortOrder: "asc" as const } },
  rounds: { orderBy: { sequence: "asc" as const } },
  faqs: { orderBy: { sortOrder: "asc" as const } },
  coordinators: true,
  prizes: true,
  schedules: { orderBy: { startsAt: "asc" as const } },
  judgingCriteria: true,
  downloads: true,
  sponsors: {
    include: {
      sponsor: true
    }
  },
  announcements: {
    orderBy: {
      publishedAt: "desc" as const
    }
  }
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly auditService: AuditService
  ) {}

  private async assertEventAccess(eventId: string, user: AuthUser) {
    if (user.role === "SUPER_ADMIN") {
      return;
    }

    const assignment = await this.prisma.eventAdminAssignment.findFirst({
      where: {
        eventId,
        userId: user.id
      }
    });

    if (!assignment) {
      throw new ForbiddenException("You are not assigned to this event.");
    }
  }

  private serializeEvent(event: Prisma.EventGetPayload<{ include: typeof adminEventInclude }>) {
    return {
      id: event.id,
      slug: event.slug,
      name: event.name,
      tagline: event.tagline,
      category: event.category,
      shortDescription: event.shortDescription,
      longDescription: event.longDescription,
      venue: event.venue,
      mode: event.mode,
      accent: event.accent,
      participantLimit: event.participantLimit,
      minTeamSize: event.minTeamSize,
      maxTeamSize: event.maxTeamSize,
      registrationStatus: event.registrationStatus,
      countdownTo: event.countdownTo?.toISOString() ?? null,
      workflowStatus: event.workflowStatus,
      sections: event.sections.map((item) => ({
        title: item.title,
        key: item.key,
        content: item.content,
        sortOrder: item.sortOrder
      })),
      rules: event.rules.map((item) => ({
        title: item.title,
        description: item.description,
        sortOrder: item.sortOrder
      })),
      rounds: event.rounds.map((item) => ({
        title: item.title,
        sequence: item.sequence,
        summary: item.summary,
        judgingFocus: item.judgingFocus,
        startsAt: item.startsAt?.toISOString() ?? null
      })),
      faqs: event.faqs.map((item) => ({
        question: item.question,
        answer: item.answer,
        sortOrder: item.sortOrder
      })),
      coordinators: event.coordinators.map((item) => ({
        name: item.name,
        role: item.role,
        email: item.email,
        phone: item.phone
      })),
      prizes: event.prizes.map((item) => ({
        label: item.label,
        value: item.value
      })),
      schedules: event.schedules.map((item) => ({
        label: item.label,
        description: item.description,
        startsAt: item.startsAt.toISOString(),
        venue: item.venue
      })),
      judgingCriteria: event.judgingCriteria.map((item) => ({
        title: item.title,
        description: item.description,
        weightage: item.weightage
      })),
      downloads: event.downloads.map((item) => ({
        title: item.title,
        url: item.url,
        kind: item.kind
      })),
      announcements: event.announcements.map((item) => ({
        title: item.title,
        body: item.body,
        tone: item.tone,
        publishedAt: item.publishedAt.toISOString()
      }))
    };
  }

  private sanitizePayload(payload: UpsertEventDto) {
    return {
      ...payload,
      slug: payload.slug ? sanitizeText(payload.slug).toLowerCase() : undefined,
      name: payload.name ? sanitizeText(payload.name) : undefined,
      tagline: payload.tagline ? sanitizeText(payload.tagline) : undefined,
      category: payload.category ? sanitizeText(payload.category) : undefined,
      shortDescription: payload.shortDescription
        ? sanitizeText(payload.shortDescription)
        : undefined,
      longDescription: payload.longDescription ? sanitizeText(payload.longDescription) : undefined,
      venue: payload.venue ? sanitizeText(payload.venue) : undefined,
      accent: payload.accent ? sanitizeText(payload.accent) : undefined
    };
  }

  private async createVersion(entityId: string, snapshot: Record<string, unknown>, userId?: string) {
    const latestVersion = await this.prisma.contentVersion.findFirst({
      where: {
        entityType: "Event",
        entityId
      },
      orderBy: {
        version: "desc"
      }
    });

    return this.prisma.contentVersion.create({
      data: {
        entityType: "Event",
        entityId,
        version: (latestVersion?.version ?? 0) + 1,
        snapshot: toJsonValue(snapshot),
        createdById: userId
      }
    });
  }

  private defaultEventPayload(payload: UpsertEventDto) {
    return {
      slug: payload.slug ?? `event-${Date.now()}`,
      name: payload.name ?? "Untitled Event",
      tagline: payload.tagline ?? "Premium finance experience",
      category: payload.category ?? "Flagship",
      shortDescription: payload.shortDescription ?? "Dynamic event content pending configuration.",
      longDescription:
        payload.longDescription ??
        "This event has been created inside the FINASTRA content workflow and is awaiting deeper editorial enrichment.",
      venue: payload.venue ?? "Main Campus",
      mode: payload.mode ?? "OFFLINE",
      accent: payload.accent ?? "#2FFFD6",
      participantLimit: payload.participantLimit ?? 100,
      minTeamSize: payload.minTeamSize ?? 2,
      maxTeamSize: payload.maxTeamSize ?? 4,
      registrationStatus: payload.registrationStatus ?? "OPEN",
      countdownTo: payload.countdownTo ? new Date(payload.countdownTo) : null,
      sections: payload.sections ?? [],
      rules: payload.rules ?? [],
      rounds: payload.rounds ?? [],
      faqs: payload.faqs ?? [],
      coordinators: payload.coordinators ?? [],
      prizes: payload.prizes ?? [],
      schedules: payload.schedules ?? [],
      judgingCriteria: payload.judgingCriteria ?? [],
      downloads: payload.downloads ?? [],
      announcements: payload.announcements ?? []
    };
  }

  private async persistEvent(
    eventId: string | null,
    payload: UpsertEventDto,
    actorId?: string
  ) {
    const safePayload = this.defaultEventPayload(this.sanitizePayload(payload));
    const existing =
      eventId == null
        ? null
        : await this.prisma.event.findUnique({
            where: { id: eventId },
            include: adminEventInclude
          });

    const merged = existing
      ? {
          ...this.serializeEvent(existing),
          ...safePayload,
          countdownTo: safePayload.countdownTo ?? existing.countdownTo?.toISOString() ?? null,
          sections: payload.sections ?? this.serializeEvent(existing).sections,
          rules: payload.rules ?? this.serializeEvent(existing).rules,
          rounds: payload.rounds ?? this.serializeEvent(existing).rounds,
          faqs: payload.faqs ?? this.serializeEvent(existing).faqs,
          coordinators: payload.coordinators ?? this.serializeEvent(existing).coordinators,
          prizes: payload.prizes ?? this.serializeEvent(existing).prizes,
          schedules: payload.schedules ?? this.serializeEvent(existing).schedules,
          judgingCriteria:
            payload.judgingCriteria ?? this.serializeEvent(existing).judgingCriteria,
          downloads: payload.downloads ?? this.serializeEvent(existing).downloads,
          announcements: payload.announcements ?? this.serializeEvent(existing).announcements
        }
      : safePayload;

    const data: Prisma.EventUncheckedCreateInput | Prisma.EventUncheckedUpdateInput = {
      slug: String(merged.slug),
      name: String(merged.name),
      tagline: String(merged.tagline),
      category: String(merged.category),
      shortDescription: String(merged.shortDescription),
      longDescription: String(merged.longDescription),
      venue: String(merged.venue),
      mode: merged.mode as never,
      accent: String(merged.accent),
      participantLimit: Number(merged.participantLimit),
      minTeamSize: Number(merged.minTeamSize),
      maxTeamSize: Number(merged.maxTeamSize),
      registrationStatus: merged.registrationStatus as never,
      workflowStatus: "PUBLISHED",
      countdownTo: merged.countdownTo ? new Date(String(merged.countdownTo)) : null,
      updatedById: actorId ?? null
    };

    const result = await this.prisma.$transaction(async (transaction) => {
      const savedEvent =
        eventId == null
          ? await transaction.event.create({
              data: {
                ...(data as Prisma.EventUncheckedCreateInput),
                createdById: actorId ?? null
              }
            })
          : await transaction.event.update({
              where: { id: eventId },
              data
            });

      await Promise.all([
        transaction.eventSection.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.eventRule.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.eventRound.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.eventFaq.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.eventCoordinator.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.eventPrize.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.eventSchedule.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.eventJudgingCriterion.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.eventDownload.deleteMany({ where: { eventId: savedEvent.id } }),
        transaction.announcement.deleteMany({ where: { eventId: savedEvent.id } })
      ]);

      if (Array.isArray(merged.sections) && merged.sections.length > 0) {
        await transaction.eventSection.createMany({
          data: merged.sections.map((item, index) => ({
            eventId: savedEvent.id,
            key: String(item.key ?? `section-${index + 1}`),
            title: String(item.title ?? `Section ${index + 1}`),
            content: String(item.content ?? ""),
            sortOrder: Number(item.sortOrder ?? index + 1)
          }))
        });
      }

      if (Array.isArray(merged.rules) && merged.rules.length > 0) {
        await transaction.eventRule.createMany({
          data: merged.rules.map((item, index) => ({
            eventId: savedEvent.id,
            title: String(item.title ?? `Rule ${index + 1}`),
            description: String(item.description ?? ""),
            sortOrder: Number(item.sortOrder ?? index + 1)
          }))
        });
      }

      if (Array.isArray(merged.rounds) && merged.rounds.length > 0) {
        await transaction.eventRound.createMany({
          data: merged.rounds.map((item, index) => ({
            eventId: savedEvent.id,
            title: String(item.title ?? `Round ${index + 1}`),
            sequence: Number(item.sequence ?? index + 1),
            summary: String(item.summary ?? ""),
            judgingFocus: String(item.judgingFocus ?? ""),
            startsAt: item.startsAt ? new Date(String(item.startsAt)) : null
          }))
        });
      }

      if (Array.isArray(merged.faqs) && merged.faqs.length > 0) {
        await transaction.eventFaq.createMany({
          data: merged.faqs.map((item, index) => ({
            eventId: savedEvent.id,
            question: String(item.question ?? `Question ${index + 1}`),
            answer: String(item.answer ?? ""),
            sortOrder: Number(item.sortOrder ?? index + 1)
          }))
        });
      }

      if (Array.isArray(merged.coordinators) && merged.coordinators.length > 0) {
        await transaction.eventCoordinator.createMany({
          data: merged.coordinators.map((item) => ({
            eventId: savedEvent.id,
            name: String(item.name ?? "Coordinator"),
            role: String(item.role ?? "Lead"),
            email: String(item.email ?? "coordinator@finastrafest.in"),
            phone: String(item.phone ?? "+91 90000 00000")
          }))
        });
      }

      if (Array.isArray(merged.prizes) && merged.prizes.length > 0) {
        await transaction.eventPrize.createMany({
          data: merged.prizes.map((item) => ({
            eventId: savedEvent.id,
            label: String(item.label ?? "Prize"),
            value: String(item.value ?? "TBA")
          }))
        });
      }

      if (Array.isArray(merged.schedules) && merged.schedules.length > 0) {
        await transaction.eventSchedule.createMany({
          data: merged.schedules.map((item) => ({
            eventId: savedEvent.id,
            label: String(item.label ?? "Timeline"),
            description: String(item.description ?? ""),
            venue: String(item.venue ?? String(merged.venue)),
            startsAt: item.startsAt ? new Date(String(item.startsAt)) : new Date()
          }))
        });
      }

      if (Array.isArray(merged.judgingCriteria) && merged.judgingCriteria.length > 0) {
        await transaction.eventJudgingCriterion.createMany({
          data: merged.judgingCriteria.map((item) => ({
            eventId: savedEvent.id,
            title: String(item.title ?? "Criterion"),
            description: String(item.description ?? ""),
            weightage: Number(item.weightage ?? 0)
          }))
        });
      }

      if (Array.isArray(merged.downloads) && merged.downloads.length > 0) {
        await transaction.eventDownload.createMany({
          data: merged.downloads.map((item) => ({
            eventId: savedEvent.id,
            title: String(item.title ?? "Document"),
            url: String(item.url ?? "https://cdn.finastrafest.in/document.pdf"),
            kind: String(item.kind ?? "RULEBOOK")
          }))
        });
      }

      if (Array.isArray(merged.announcements) && merged.announcements.length > 0) {
        await transaction.announcement.createMany({
          data: merged.announcements.map((item) => ({
            eventId: savedEvent.id,
            title: String(item.title ?? "Announcement"),
            body: String(item.body ?? ""),
            tone: (item.tone as "INFO" | "ALERT" | "SUCCESS" | undefined) ?? "INFO",
            publishedAt: item.publishedAt ? new Date(String(item.publishedAt)) : new Date(),
            createdById: actorId ?? null
          }))
        });
      }

      return transaction.event.findUniqueOrThrow({
        where: { id: savedEvent.id },
        include: adminEventInclude
      });
    });

    await this.createVersion(result.id, this.serializeEvent(result), actorId);
    await this.redis.invalidateByPrefix("public:");

    return result;
  }

  async listEvents(user: AuthUser) {
    const events =
      user.role === "SUPER_ADMIN"
        ? await this.prisma.event.findMany({
            include: adminEventInclude,
            orderBy: { updatedAt: "desc" }
          })
        : await this.prisma.event.findMany({
            where: {
              adminAssignments: {
                some: {
                  userId: user.id
                }
              }
            },
            include: adminEventInclude,
            orderBy: { updatedAt: "desc" }
          });

    return events.map((event) => this.serializeEvent(event));
  }

  async getEvent(eventId: string, user: AuthUser) {
    await this.assertEventAccess(eventId, user);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: adminEventInclude
    });

    if (!event) {
      throw new NotFoundException("Event not found.");
    }

    return this.serializeEvent(event);
  }

  async createEvent(payload: UpsertEventDto, user: AuthUser, ipAddress?: string) {
    if (user.role === "SUPER_ADMIN") {
      const event = await this.persistEvent(null, payload, user.id);

      await this.auditService.log({
        actorId: user.id,
        action: "EVENT_CREATED",
        entityType: "Event",
        entityId: event.id,
        ipAddress
      });

      return {
        mode: "published",
        event: this.serializeEvent(event)
      };
    }

    const safePayload = this.defaultEventPayload(this.sanitizePayload(payload));
    const approval = await this.prisma.approvalRequest.create({
      data: {
        entityType: "Event",
        entityId: "NEW",
        action: ChangeAction.CREATE,
        status: ApprovalStatus.PENDING,
        beforeSnapshot: toJsonValue({}),
        afterSnapshot: toJsonValue(safePayload),
        diff: toJsonValue(buildDiff({}, safePayload)),
        submittedById: user.id
      }
    });

    await this.auditService.log({
      actorId: user.id,
      action: "EVENT_CREATE_REQUESTED",
      entityType: "ApprovalRequest",
      entityId: approval.id,
      ipAddress
    });

    return {
      mode: "approval",
      approvalId: approval.id
    };
  }

  async updateEvent(eventId: string, payload: UpsertEventDto, user: AuthUser, ipAddress?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: adminEventInclude
    });

    if (!event) {
      throw new NotFoundException("Event not found.");
    }

    await this.assertEventAccess(eventId, user);

    if (user.role === "SUPER_ADMIN") {
      const savedEvent = await this.persistEvent(eventId, payload, user.id);

      await this.auditService.log({
        actorId: user.id,
        action: "EVENT_UPDATED",
        entityType: "Event",
        entityId: eventId,
        ipAddress
      });

      return {
        mode: "published",
        event: this.serializeEvent(savedEvent)
      };
    }

    const before = this.serializeEvent(event);
    const after = {
      ...before,
      ...this.sanitizePayload(payload)
    };

    const approval = await this.prisma.approvalRequest.create({
      data: {
        entityType: "Event",
        entityId: eventId,
        action: ChangeAction.UPDATE,
        status: ApprovalStatus.PENDING,
        beforeSnapshot: toJsonValue(before),
        afterSnapshot: toJsonValue(after),
        diff: toJsonValue(buildDiff(before, after)),
        submittedById: user.id
      }
    });

    await this.auditService.log({
      actorId: user.id,
      action: "EVENT_UPDATE_REQUESTED",
      entityType: "ApprovalRequest",
      entityId: approval.id,
      ipAddress
    });

    return {
      mode: "approval",
      approvalId: approval.id
    };
  }

  async applyApprovedChange(approvalRequestId: string, reviewerId: string) {
    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalRequestId }
    });

    if (!approval) {
      throw new NotFoundException("Approval request not found.");
    }

    if (approval.entityType !== "Event") {
      throw new ForbiddenException("Unsupported approval type.");
    }

    const event =
      approval.action === ChangeAction.CREATE
        ? await this.persistEvent(null, approval.afterSnapshot as UpsertEventDto, reviewerId)
        : await this.persistEvent(
            approval.entityId,
            approval.afterSnapshot as UpsertEventDto,
            reviewerId
          );

    await this.prisma.approvalRequest.update({
      where: { id: approval.id },
      data: {
        status: ApprovalStatus.APPROVED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        entityId: event.id
      }
    });

    await this.auditService.log({
      actorId: reviewerId,
      action: "EVENT_CHANGE_APPROVED",
      entityType: "Event",
      entityId: event.id
    });

    return this.serializeEvent(event);
  }
}
