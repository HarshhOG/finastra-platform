import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 25
    });

    return notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      channel: notification.channel,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString()
    }));
  }

  async markRead(notificationId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isRead: true
      }
    });

    return {
      success: true
    };
  }
}
