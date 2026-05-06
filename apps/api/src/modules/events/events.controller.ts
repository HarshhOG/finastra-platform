import { Body, Controller, Get, Param, Patch, Post, UseGuards, Req } from "@nestjs/common";
import type { Request } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { UpsertEventDto } from "./dto/upsert-event.dto";
import { EventsService } from "./events.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN", "TEAM_ADMIN")
@Controller("admin/events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEvents(@CurrentUser() user: { id: string; role: string }) {
    return this.eventsService.listEvents(user);
  }

  @Get(":id")
  getEvent(@Param("id") eventId: string, @CurrentUser() user: { id: string; role: string }) {
    return this.eventsService.getEvent(eventId, user);
  }

  @Post()
  createEvent(
    @Body() body: UpsertEventDto,
    @CurrentUser() user: { id: string; role: string },
    @Req() request: Request
  ) {
    return this.eventsService.createEvent(body, user, request.ip);
  }

  @Patch(":id")
  updateEvent(
    @Param("id") eventId: string,
    @Body() body: UpsertEventDto,
    @CurrentUser() user: { id: string; role: string },
    @Req() request: Request
  ) {
    return this.eventsService.updateEvent(eventId, body, user, request.ip);
  }
}
