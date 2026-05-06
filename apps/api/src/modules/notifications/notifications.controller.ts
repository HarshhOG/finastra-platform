import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { NotificationsService } from "./notifications.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN", "TEAM_ADMIN")
@Controller("admin/notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.notificationsService.listForUser(user.id);
  }

  @Post(":id/read")
  markRead(@Param("id") notificationId: string, @CurrentUser() user: { id: string }) {
    return this.notificationsService.markRead(notificationId, user.id);
  }
}
