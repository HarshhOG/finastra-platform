import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { RedisService } from "../../database/redis.service";
import { AuditService } from "../audit/audit.service";
import { MailService } from "../mail/mail.service";
import { CreateCollegeRegistrationDto } from "./dto/create-college-registration.dto";
import { CreateCrRegistrationDto } from "./dto/create-cr-registration.dto";
import { CreateTeamRegistrationDto } from "./dto/create-team-registration.dto";
import { sanitizeText } from "../../common/utils/sanitize.util";

const publicEventInclude = {
  heroAsset: true,
  bannerAsset: true,
  sections: {
    orderBy: { sortOrder: "asc" as const }
  },
  rules: {
    orderBy: { sortOrder: "asc" as const }
  },
  rounds: {
    orderBy: { sequence: "asc" as const }
  },
  faqs: {
    orderBy: { sortOrder: "asc" as const }
  },
  coordinators: true,
  prizes: true,
  schedules: {
    orderBy: { startsAt: "asc" as const }
  },
  judgingCriteria: true,
  downloads: true,
  gallery: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      asset: true
    }
  },
  sponsors: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      sponsor: {
        include: {
          logo: true
        }
      }
    }
  },
  announcements: {
    orderBy: {
      publishedAt: "desc" as const
    }
  }
};

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService
  ) {}

  private mapAsset(asset: {
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO" | "DOCUMENT";
    altText: string | null;
    blurDataUrl: string | null;
  } | null) {
    if (!asset) {
      return null;
    }

    return {
      id: asset.id,
      url: asset.url,
      type: asset.type,
      altText: asset.altText,
      blurDataUrl: asset.blurDataUrl
    };
  }

  private mapEventCard(event: Prisma.EventGetPayload<{ include: typeof publicEventInclude }>) {
    return {
      id: event.id,
      slug: event.slug,
      name: event.name,
      tagline: event.tagline,
      category: event.category,
      shortDescription: event.shortDescription,
      heroAsset: this.mapAsset(event.heroAsset),
      accent: event.accent,
      participantLimit: event.participantLimit,
      minTeamSize: event.minTeamSize,
      maxTeamSize: event.maxTeamSize,
      registrationStatus: event.workflowStatus === "PUBLISHED" ? "APPROVED" : "UNDER_REVIEW",
      countdownTo: event.countdownTo?.toISOString() ?? null
    };
  }

  private mapEventDetail(event: Prisma.EventGetPayload<{ include: typeof publicEventInclude }>) {
    return {
      ...this.mapEventCard(event),
      longDescription: event.longDescription,
      venue: event.venue,
      mode: event.mode,
      sections: event.sections.map((section) => ({
        id: section.id,
        key: section.key,
        title: section.title,
        content: section.content
      })),
      rules: event.rules.map((rule) => ({
        id: rule.id,
        title: rule.title,
        description: rule.description
      })),
      rounds: event.rounds.map((round) => ({
        id: round.id,
        title: round.title,
        sequence: round.sequence,
        summary: round.summary,
        judgingFocus: round.judgingFocus,
        startsAt: round.startsAt?.toISOString() ?? null
      })),
      faqs: event.faqs.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer
      })),
      coordinators: event.coordinators.map((coordinator) => ({
        id: coordinator.id,
        name: coordinator.name,
        role: coordinator.role,
        email: coordinator.email,
        phone: coordinator.phone
      })),
      prizes: event.prizes.map((prize) => ({
        id: prize.id,
        label: prize.label,
        value: prize.value
      })),
      schedules: event.schedules.map((schedule) => ({
        id: schedule.id,
        label: schedule.label,
        description: schedule.description,
        startsAt: schedule.startsAt.toISOString(),
        venue: schedule.venue
      })),
      judgingCriteria: event.judgingCriteria.map((criterion) => ({
        id: criterion.id,
        title: criterion.title,
        description: criterion.description,
        weightage: criterion.weightage
      })),
      downloads: event.downloads.map((download) => ({
        id: download.id,
        title: download.title,
        url: download.url,
        kind: download.kind as "BROCHURE" | "RULEBOOK" | "TEMPLATE" | "CERTIFICATE"
      })),
      sponsors: event.sponsors.map((eventSponsor) => ({
        id: eventSponsor.sponsor.id,
        name: eventSponsor.sponsor.name,
        tier: eventSponsor.sponsor.tier,
        websiteUrl: eventSponsor.sponsor.websiteUrl,
        logo: this.mapAsset(eventSponsor.sponsor.logo)
      })),
      gallery: event.gallery.map((galleryItem) => this.mapAsset(galleryItem.asset)).filter(Boolean),
      announcements: event.announcements.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        tone: announcement.tone,
        publishedAt: announcement.publishedAt.toISOString()
      }))
    };
  }

  private async hydrateFormOptions(formId: string) {
    const fields = await this.prisma.dynamicFormField.findMany({
      where: { formId },
      orderBy: { sortOrder: "asc" }
    });

    const colleges = await this.prisma.college.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true
      }
    });
    const events = await this.prisma.event.findMany({
      where: { workflowStatus: "PUBLISHED" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true
      }
    });

    return fields.map((field) => {
      const source = (field.options as { source?: string } | null)?.source;
      const options =
        source === "colleges"
          ? colleges.map((college) => ({ label: college.name, value: college.id }))
          : source === "events"
            ? events.map((event) => ({ label: event.name, value: event.id }))
            : Array.isArray((field.options as { label: string; value: string }[] | null))
              ? ((field.options as { label: string; value: string }[]) ?? [])
              : [];

      return {
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        required: field.required,
        helperText: field.helperText,
        validationRule: field.validationRule,
        options
      };
    });
  }

  async getSiteExperience() {
    const cacheKey = "public:site";
    const cached = await this.redis.getJson(cacheKey);
    if (cached) {
      return cached;
    }

    const [heroSetting, homeSections, featuredEvents, eventCount, collegeCount, registrationCount, latestAnnouncements] =
      await Promise.all([
        this.prisma.siteSetting.findUnique({
          where: { key: "home.hero" }
        }),
        this.prisma.pageSection.findMany({
          where: { pageSlug: "home" },
          orderBy: { sortOrder: "asc" }
        }),
        this.prisma.event.findMany({
          where: { workflowStatus: "PUBLISHED" },
          include: publicEventInclude,
          take: 6,
          orderBy: { updatedAt: "desc" }
        }),
        this.prisma.event.count(),
        this.prisma.college.count(),
        this.prisma.eventRegistration.count(),
        this.prisma.announcement.findMany({
          orderBy: { publishedAt: "desc" },
          take: 5
        })
      ]);

    const result = {
      hero: heroSetting?.value ?? {},
      sections: homeSections,
      stats: [
        { label: "Flagship Events", value: eventCount },
        { label: "Partner Colleges", value: collegeCount },
        { label: "Live Registrations", value: registrationCount }
      ],
      featuredEvents: featuredEvents.map((event) => this.mapEventCard(event)),
      announcements: latestAnnouncements.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        tone: announcement.tone,
        publishedAt: announcement.publishedAt.toISOString()
      }))
    };

    await this.redis.setJson(cacheKey, result, 180);

    return result;
  }

  async getEvents() {
    const cacheKey = "public:events";
    const cached = await this.redis.getJson(cacheKey);
    if (cached) {
      return cached;
    }

    const events = await this.prisma.event.findMany({
      where: {
        workflowStatus: "PUBLISHED"
      },
      include: publicEventInclude,
      orderBy: {
        updatedAt: "desc"
      }
    });

    const result = events.map((event) => this.mapEventCard(event));
    await this.redis.setJson(cacheKey, result, 180);
    return result;
  }

  async getEventBySlug(slug: string) {
    const cacheKey = `public:event:${slug}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) {
      return cached;
    }

    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: publicEventInclude
    });

    if (!event || event.workflowStatus !== "PUBLISHED") {
      throw new NotFoundException("Event not found.");
    }

    const result = this.mapEventDetail(event);
    await this.redis.setJson(cacheKey, result, 180);
    return result;
  }

  async getFormBySlug(slug: string) {
    const form = await this.prisma.dynamicForm.findUnique({
      where: { slug }
    });

    if (!form) {
      throw new NotFoundException("Form not found.");
    }

    return {
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description,
      submitLabel: form.submitLabel,
      successMessage: form.successMessage,
      fields: await this.hydrateFormOptions(form.id)
    };
  }

  async getOrganisingTeam() {
    const [sections, members] = await Promise.all([
      this.prisma.pageSection.findMany({
        where: { pageSlug: "organising-team" },
        orderBy: { sortOrder: "asc" }
      }),
      this.prisma.teamMember.findMany({
        orderBy: {
          sortOrder: "asc"
        },
        include: {
          avatar: true
        }
      })
    ]);

    return {
      sections,
      members: members.map((member) => ({
        id: member.id,
        name: member.name,
        title: member.title,
        division: member.division,
        email: member.email,
        linkedinUrl: member.linkedinUrl,
        avatar: this.mapAsset(member.avatar)
      }))
    };
  }

  async getContactData() {
    const [sections, channels] = await Promise.all([
      this.prisma.pageSection.findMany({
        where: { pageSlug: "contact" },
        orderBy: { sortOrder: "asc" }
      }),
      this.prisma.contactChannel.findMany({
        orderBy: { sortOrder: "asc" }
      })
    ]);

    return {
      sections,
      channels
    };
  }

  async getAnnouncements() {
    const announcements = await this.prisma.announcement.findMany({
      orderBy: {
        publishedAt: "desc"
      },
      take: 20
    });

    return announcements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      tone: announcement.tone,
      publishedAt: announcement.publishedAt.toISOString()
    }));
  }

  private async createAdminNotifications(title: string, message: string) {
    const admins = await this.prisma.user.findMany({
      where: {
        role: {
          in: ["SUPER_ADMIN", "TEAM_ADMIN"]
        }
      },
      select: {
        id: true
      }
    });

    if (admins.length === 0) {
      return;
    }

    await this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title,
        message,
        channel: "IN_APP"
      }))
    });
  }

  async submitCollegeRegistration(dto: CreateCollegeRegistrationDto, ipAddress?: string) {
    const created = await this.prisma.collegeRegistration.create({
      data: {
        collegeName: sanitizeText(dto.collegeName),
        collegeCity: dto.collegeCity ? sanitizeText(dto.collegeCity) : null,
        collegeState: dto.collegeState ? sanitizeText(dto.collegeState) : null,
        facultyName: sanitizeText(dto.facultyName),
        facultyEmail: dto.facultyEmail.toLowerCase(),
        facultyPhone: sanitizeText(dto.facultyPhone),
        crNomineeName: sanitizeText(dto.crNomineeName),
        crNomineeEmail: dto.crNomineeEmail.toLowerCase(),
        crNomineePhone: sanitizeText(dto.crNomineePhone)
      }
    });

    await Promise.all([
      this.createAdminNotifications(
        "New college registration",
        `${created.collegeName} has submitted an institutional registration.`
      ),
      this.mailService.sendRegistrationConfirmation({
        to: created.facultyEmail,
        recipientName: created.facultyName,
        title: "College registration received",
        body: `${created.collegeName} has been submitted successfully for FINASTRA / ARTHYUG review.`
      }),
      this.mailService.sendAdminAlert(
        "New college registration",
        `${created.collegeName} has submitted an institutional registration.`
      ),
      this.auditService.log({
        action: "COLLEGE_REGISTRATION_CREATED",
        entityType: "CollegeRegistration",
        entityId: created.id,
        ipAddress
      })
    ]);

    return {
      id: created.id,
      status: created.status
    };
  }

  async submitCrRegistration(dto: CreateCrRegistrationDto, ipAddress?: string) {
    const college = await this.prisma.college.findUnique({
      where: { id: dto.collegeId }
    });

    if (!college) {
      throw new NotFoundException("College not found.");
    }

    const created = await this.prisma.crRegistration.create({
      data: {
        collegeId: dto.collegeId,
        fullName: sanitizeText(dto.fullName),
        email: dto.email.toLowerCase(),
        phone: sanitizeText(dto.phone),
        enrollmentId: sanitizeText(dto.enrollmentId)
      }
    });

    await Promise.all([
      this.createAdminNotifications(
        "New CR verification",
        `${created.fullName} is awaiting campus representative verification.`
      ),
      this.mailService.sendRegistrationConfirmation({
        to: created.email,
        recipientName: created.fullName,
        title: "CR verification received",
        body: `Your campus representative registration for ${college.name} is now under review.`
      }),
      this.mailService.sendAdminAlert(
        "New CR verification",
        `${created.fullName} from ${college.name} is awaiting campus representative verification.`
      ),
      this.auditService.log({
        action: "CR_REGISTRATION_CREATED",
        entityType: "CrRegistration",
        entityId: created.id,
        ipAddress
      })
    ]);

    return {
      id: created.id,
      status: created.status
    };
  }

  async submitTeamRegistration(dto: CreateTeamRegistrationDto, ipAddress?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId }
    });

    if (!event || event.workflowStatus !== "PUBLISHED") {
      throw new NotFoundException("Selected event is unavailable.");
    }

    const college = await this.prisma.college.findUnique({
      where: { id: dto.collegeId }
    });

    if (!college) {
      throw new NotFoundException("Selected college is unavailable.");
    }

    const totalTeamSize = dto.participants.length + 1;
    if (totalTeamSize < event.minTeamSize || totalTeamSize > event.maxTeamSize) {
      throw new BadRequestException(
        `This event requires ${event.minTeamSize} to ${event.maxTeamSize} members.`
      );
    }

    const existingLeader = dto.participants.find(
      (participant) => participant.email.toLowerCase() === dto.leaderEmail.toLowerCase()
    );

    if (existingLeader) {
      throw new BadRequestException("Do not duplicate the leader inside the participant list.");
    }

    const teamCode = `FIN-${event.slug.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-5)}`;

    const created = await this.prisma.team.create({
      data: {
        name: sanitizeText(dto.teamName),
        code: teamCode,
        leaderName: sanitizeText(dto.leaderName),
        leaderEmail: dto.leaderEmail.toLowerCase(),
        leaderPhone: sanitizeText(dto.leaderPhone),
        size: totalTeamSize,
        specialRequirements: dto.specialRequirements
          ? sanitizeText(dto.specialRequirements)
          : null,
        collegeId: dto.collegeId,
        participants: {
          create: [
            {
              fullName: sanitizeText(dto.leaderName),
              email: dto.leaderEmail.toLowerCase(),
              phone: sanitizeText(dto.leaderPhone),
              department: "Commerce",
              yearOfStudy: "NA",
              isLeader: true,
              qrCodeValue: `${teamCode}-L`
            },
            ...dto.participants.map((participant, index) => ({
              fullName: sanitizeText(participant.fullName),
              email: participant.email.toLowerCase(),
              phone: sanitizeText(participant.phone),
              department: sanitizeText(participant.department),
              yearOfStudy: sanitizeText(participant.yearOfStudy),
              qrCodeValue: `${teamCode}-${index + 1}`
            }))
          ]
        },
        registrations: {
          create: {
            eventId: dto.eventId,
            collegeId: dto.collegeId,
            status: "SUBMITTED",
            approvalStatus: "PENDING",
            paymentStatus: "PENDING",
            qrCodeValue: teamCode
          }
        }
      },
      include: {
        registrations: true
      }
    });

    await Promise.all([
      this.createAdminNotifications(
        "New team pre-registration",
        `${created.name} registered for ${event.name}.`
      ),
      this.mailService.sendRegistrationConfirmation({
        to: created.leaderEmail,
        recipientName: created.leaderName,
        title: "Team pre-registration received",
        body: `${created.name} has been registered for ${event.name}. Your team code is ${teamCode}.`
      }),
      this.mailService.sendAdminAlert(
        "New team pre-registration",
        `${created.name} from ${college.name} registered for ${event.name}.`
      ),
      this.auditService.log({
        action: "TEAM_PRE_REGISTRATION_CREATED",
        entityType: "EventRegistration",
        entityId: created.registrations[0]?.id ?? null,
        ipAddress,
        metadata: {
          eventId: dto.eventId,
          collegeId: dto.collegeId,
          teamCode
        }
      })
    ]);

    return {
      teamCode,
      registrationId: created.registrations[0]?.id,
      status: created.registrations[0]?.status
    };
  }
}
