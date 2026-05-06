import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

type AuthUser = {
  id: string;
  role: string;
};

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  private rowsToCsv(rows: Array<Record<string, string | number | null>>) {
    if (rows.length === 0) {
      return "";
    }

    const headers = Object.keys(rows[0]);
    const escapeCell = (value: string | number | null) => {
      const raw = value == null ? "" : String(value);
      return `"${raw.replace(/"/g, "\"\"")}"`;
    };

    return [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => escapeCell(row[header] ?? "")).join(","))
    ].join("\n");
  }

  async export(type: string, user: AuthUser) {
    const exportJob = await this.prisma.exportJob.create({
      data: {
        type,
        status: "QUEUED",
        createdById: user.id
      }
    });

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

    if (type === "registrations") {
      const registrations = await this.prisma.eventRegistration.findMany({
        where:
          user.role === "SUPER_ADMIN"
            ? undefined
            : {
                event: eventScope
              },
        include: {
          event: true,
          team: true,
          college: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      const csv = this.rowsToCsv(
        registrations.map((registration) => ({
          registration_id: registration.id,
          event: registration.event.name,
          team: registration.team.name,
          college: registration.college.name,
          leader: registration.team.leaderName,
          team_size: registration.team.size,
          status: registration.status,
          payment_status: registration.paymentStatus,
          created_at: registration.createdAt.toISOString()
        }))
      );
      await this.prisma.exportJob.update({
        where: { id: exportJob.id },
        data: {
          status: "COMPLETED"
        }
      });
      return csv;
    }

    if (type === "colleges") {
      const colleges = await this.prisma.college.findMany({
        include: {
          registrations: true
        },
        orderBy: {
          name: "asc"
        }
      });

      const csv = this.rowsToCsv(
        colleges.map((college) => ({
          college_id: college.id,
          college: college.name,
          city: college.city,
          state: college.state,
          registrations: college.registrations.length
        }))
      );
      await this.prisma.exportJob.update({
        where: { id: exportJob.id },
        data: {
          status: "COMPLETED"
        }
      });
      return csv;
    }

    if (type === "payments") {
      const payments = await this.prisma.payment.findMany({
        where:
          user.role === "SUPER_ADMIN"
            ? undefined
            : {
                registration: {
                  event: eventScope
                }
              },
        include: {
          registration: {
            include: {
              event: true,
              team: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      const csv = this.rowsToCsv(
        payments.map((payment) => ({
          payment_id: payment.id,
          reference: payment.reference,
          event: payment.registration.event.name,
          team: payment.registration.team.name,
          amount: Number(payment.amount),
          currency: payment.currency,
          status: payment.status,
          paid_at: payment.paidAt?.toISOString() ?? ""
        }))
      );
      await this.prisma.exportJob.update({
        where: { id: exportJob.id },
        data: {
          status: "COMPLETED"
        }
      });
      return csv;
    }

    if (type === "teams") {
      const teams = await this.prisma.team.findMany({
        include: {
          college: true,
          registrations: {
            include: {
              event: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      const csv = this.rowsToCsv(
        teams.map((team) => ({
          team_id: team.id,
          team: team.name,
          code: team.code,
          leader: team.leaderName,
          college: team.college.name,
          event: team.registrations[0]?.event.name ?? "",
          members: team.size
        }))
      );
      await this.prisma.exportJob.update({
        where: { id: exportJob.id },
        data: {
          status: "COMPLETED"
        }
      });
      return csv;
    }

    if (type === "attendance") {
      const scans = await this.prisma.attendanceScan.findMany({
        include: {
          participant: true,
          eventRegistration: {
            include: {
              event: true,
              team: true
            }
          }
        },
        orderBy: {
          scannedAt: "desc"
        }
      });

      const csv = this.rowsToCsv(
        scans.map((scan) => ({
          scan_id: scan.id,
          event: scan.eventRegistration.event.name,
          team: scan.eventRegistration.team.name,
          participant: scan.participant?.fullName ?? "",
          checkpoint: scan.checkpoint,
          scanned_at: scan.scannedAt.toISOString()
        }))
      );
      await this.prisma.exportJob.update({
        where: { id: exportJob.id },
        data: {
          status: "COMPLETED"
        }
      });
      return csv;
    }

    await this.prisma.exportJob.update({
      where: { id: exportJob.id },
      data: {
        status: "FAILED"
      }
    });
    throw new Error("Unsupported export type.");
  }
}
