import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ApprovalStatus } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { EventsService } from "../events/events.service";

type AuthUser = {
  id: string;
  role: string;
};

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    private readonly auditService: AuditService
  ) {}

  async listApprovals(user: AuthUser) {
    const approvals = await this.prisma.approvalRequest.findMany({
      where:
        user.role === "SUPER_ADMIN"
          ? undefined
          : {
              submittedById: user.id
            },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return approvals.map((approval) => ({
      id: approval.id,
      entityType: approval.entityType,
      entityId: approval.entityId,
      action: approval.action,
      status: approval.status,
      submittedBy: approval.submittedBy,
      reviewedBy: approval.reviewedBy,
      requestedAt: approval.createdAt.toISOString(),
      reviewedAt: approval.reviewedAt?.toISOString() ?? null,
      diff: approval.diff,
      notes: approval.notes
    }));
  }

  private async getPendingApproval(approvalId: string) {
    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalId }
    });

    if (!approval) {
      throw new NotFoundException("Approval request not found.");
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new ForbiddenException("This approval request is no longer pending.");
    }

    return approval;
  }

  async approve(approvalId: string, reviewerId: string, notes?: string) {
    const approval = await this.getPendingApproval(approvalId);

    if (approval.entityType === "Event") {
      const event = await this.eventsService.applyApprovedChange(approvalId, reviewerId);

      if (notes) {
        await this.prisma.approvalRequest.update({
          where: { id: approvalId },
          data: {
            notes
          }
        });
      }

      return {
        status: "APPROVED",
        entity: event
      };
    }

    throw new ForbiddenException("Unsupported approval type.");
  }

  async reject(approvalId: string, reviewerId: string, notes?: string) {
    const approval = await this.getPendingApproval(approvalId);

    await this.prisma.approvalRequest.update({
      where: { id: approval.id },
      data: {
        status: ApprovalStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        notes: notes ?? null
      }
    });

    await this.auditService.log({
      actorId: reviewerId,
      action: "APPROVAL_REJECTED",
      entityType: approval.entityType,
      entityId: approval.entityId,
      metadata: {
        approvalId
      }
    });

    return {
      status: "REJECTED"
    };
  }
}
