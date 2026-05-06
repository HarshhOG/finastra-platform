import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

type AuthUser = {
  id: string;
  role: string;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(user: AuthUser) {
    const eventScope =
      user.role === "SUPER_ADMIN"
        ? {}
        : {
            adminAssignments: {
              some: {
                userId: user.id
              }
            }
          };

    const [eventCount, collegeCount, registrationCount, paidPayments, pendingApprovals, events, colleges] =
      await Promise.all([
        this.prisma.event.count({
          where: eventScope
        }),
        this.prisma.college.count(),
        this.prisma.eventRegistration.count({
          where:
            user.role === "SUPER_ADMIN"
              ? undefined
              : {
                  event: eventScope
                }
        }),
        this.prisma.payment.aggregate({
          where:
            user.role === "SUPER_ADMIN"
              ? { status: "PAID" }
              : {
                  status: "PAID",
                  registration: {
                    event: eventScope
                  }
                },
          _sum: {
            amount: true
          }
        }),
        this.prisma.approvalRequest.count({
          where:
            user.role === "SUPER_ADMIN"
              ? { status: "PENDING" }
              : {
                  status: "PENDING",
                  submittedById: user.id
                }
        }),
        this.prisma.event.findMany({
          where: eventScope,
          select: {
            id: true,
            name: true,
            registrations: {
              select: {
                id: true
              }
            }
          }
        }),
        this.prisma.college.findMany({
          select: {
            id: true,
            name: true,
            registrations: {
              select: {
                id: true
              }
            }
          }
        })
      ]);

    const approvalGroups = await this.prisma.approvalRequest.groupBy({
      by: ["status"],
      _count: {
        _all: true
      }
    });

    return {
      metrics: [
        {
          label: "Published events",
          value: `${eventCount}`,
          delta: "+11%",
          trend: "UP"
        },
        {
          label: "Registered colleges",
          value: `${collegeCount}`,
          delta: "+18%",
          trend: "UP"
        },
        {
          label: "Team registrations",
          value: `${registrationCount}`,
          delta: "+24%",
          trend: "UP"
        },
        {
          label: "Verified revenue",
          value: `INR ${Number(paidPayments._sum.amount ?? 0).toLocaleString("en-IN")}`,
          delta: pendingApprovals > 0 ? `${pendingApprovals} pending approvals` : "All clear",
          trend: pendingApprovals > 0 ? "NEUTRAL" : "UP"
        }
      ],
      registrationsByEvent: events.map((event) => ({
        label: event.name,
        value: event.registrations.length
      })),
      registrationsByCollege: colleges.map((college) => ({
        label: college.name,
        value: college.registrations.length
      })),
      approvalLoad: approvalGroups.map((group) => ({
        label: group.status,
        value: group._count._all
      })),
      liveHeadline:
        pendingApprovals > 0
          ? `${pendingApprovals} approval items are awaiting publish review.`
          : "All admin change requests have been processed."
    };
  }

  async getRegistrationTable(user: AuthUser) {
    const registrations = await this.prisma.eventRegistration.findMany({
      where:
        user.role === "SUPER_ADMIN"
          ? undefined
          : {
              event: {
                adminAssignments: {
                  some: {
                    userId: user.id
                  }
                }
              }
            },
      include: {
        event: {
          select: {
            name: true
          }
        },
        team: {
          select: {
            name: true,
            leaderName: true,
            size: true
          }
        },
        college: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return registrations.map((registration) => ({
      id: registration.id,
      event: registration.event.name,
      team: registration.team.name,
      leader: registration.team.leaderName,
      college: registration.college.name,
      members: registration.team.size,
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      createdAt: registration.createdAt.toISOString()
    }));
  }
}
