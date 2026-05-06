import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { getClientIp } from "../../common/utils/request.util";
import { RateLimitService } from "../../database/rate-limit.service";
import { CreateCollegeRegistrationDto } from "./dto/create-college-registration.dto";
import { CreateCrRegistrationDto } from "./dto/create-cr-registration.dto";
import { CreateTeamRegistrationDto } from "./dto/create-team-registration.dto";
import { PublicService } from "./public.service";

@Public()
@Controller("public")
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly rateLimitService: RateLimitService
  ) {}

  private async guardRegistrationRateLimit(request: Request, action: string) {
    const ip = getClientIp(request);
    const result = await this.rateLimitService.consume(`registration:${action}:${ip}`);

    if (!result.success) {
      throw new HttpException("Too many attempts. Please try again shortly.", HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  @Get("site")
  getSiteExperience() {
    return this.publicService.getSiteExperience();
  }

  @Get("events")
  getEvents() {
    return this.publicService.getEvents();
  }

  @Get("events/:slug")
  getEvent(@Param("slug") slug: string) {
    return this.publicService.getEventBySlug(slug);
  }

  @Get("forms/:slug")
  getForm(@Param("slug") slug: string) {
    return this.publicService.getFormBySlug(slug);
  }

  @Get("team")
  getTeam() {
    return this.publicService.getOrganisingTeam();
  }

  @Get("contact")
  getContact() {
    return this.publicService.getContactData();
  }

  @Get("announcements")
  getAnnouncements() {
    return this.publicService.getAnnouncements();
  }

  @Post("register/college")
  async createCollegeRegistration(@Body() body: CreateCollegeRegistrationDto, @Req() request: Request) {
    await this.guardRegistrationRateLimit(request, "college");
    return this.publicService.submitCollegeRegistration(body, request.ip);
  }

  @Post("register/cr")
  async createCrRegistration(@Body() body: CreateCrRegistrationDto, @Req() request: Request) {
    await this.guardRegistrationRateLimit(request, "cr");
    return this.publicService.submitCrRegistration(body, request.ip);
  }

  @Post("register/team")
  async createTeamRegistration(@Body() body: CreateTeamRegistrationDto, @Req() request: Request) {
    await this.guardRegistrationRateLimit(request, "team");
    return this.publicService.submitTeamRegistration(body, request.ip);
  }
}
