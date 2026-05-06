import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createPrismaClientOptions } from "../src/database/prisma-client-options";

const prisma = new PrismaClient(createPrismaClientOptions());

const eventBlueprints = [
  ["market-masters", "Market Masters", "Live trading arena"],
  ["equity-oracle", "Equity Oracle", "Research-backed investing duel"],
  ["mna-war-room", "M&A War Room", "Corporate strategy showdown"],
  ["budget-battle", "Budget Battle", "Policy, deficit, and growth simulator"],
  ["finhacks", "FinHacks", "Finance x product innovation sprint"],
  ["brand-capital", "Brand Capital", "High-conviction branding case league"],
  ["bull-bear-debate", "Bull vs Bear", "Fast thesis debate under pressure"],
  ["tax-titans", "Tax Titans", "Compliance and advisory challenge"],
  ["wealth-lab", "Wealth Lab", "Personal finance storytelling challenge"],
  ["ledger-x", "Ledger X", "Forensic accounting pressure test"],
  ["arthyug-summit", "Arthyug Summit", "Flagship commerce leadership conclave"]
] as const;

async function seedPermissions() {
  const permissions = [
    ["dashboard.view", "View dashboard"],
    ["events.manage", "Manage event content"],
    ["approvals.review", "Review approval queue"],
    ["registrations.view", "View registration data"],
    ["exports.generate", "Generate exports"],
    ["users.manage", "Manage platform users"],
    ["announcements.publish", "Publish announcements"]
  ];

  for (const [key, label] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: { label },
      create: { key, label }
    });

    const roleMatrix: Record<string, UserRole[]> = {
      "dashboard.view": [UserRole.SUPER_ADMIN, UserRole.TEAM_ADMIN],
      "events.manage": [UserRole.SUPER_ADMIN, UserRole.TEAM_ADMIN],
      "approvals.review": [UserRole.SUPER_ADMIN],
      "registrations.view": [UserRole.SUPER_ADMIN, UserRole.TEAM_ADMIN],
      "exports.generate": [UserRole.SUPER_ADMIN, UserRole.TEAM_ADMIN],
      "users.manage": [UserRole.SUPER_ADMIN],
      "announcements.publish": [UserRole.SUPER_ADMIN, UserRole.TEAM_ADMIN]
    };

    for (const role of roleMatrix[key]) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          role,
          permissionId: permission.id
        }
      });
    }
  }
}

async function seedSiteContent() {
  await prisma.siteSetting.upsert({
    where: { key: "home.hero" },
    update: {
      value: {
        eyebrow: "Inter-college Commerce and Finance Fest",
        title: "FINASTRA / ARTHYUG",
        subtitle:
          "A cinematic finance-fest platform engineered like a startup product, with live event intelligence, dynamic registrations, and premium digital storytelling.",
        primaryCta: "Explore Events",
        secondaryCta: "Register College",
        spotlightMetric: "11 flagship competitions"
      }
    },
    create: {
      key: "home.hero",
      value: {
        eyebrow: "Inter-college Commerce and Finance Fest",
        title: "FINASTRA / ARTHYUG",
        subtitle:
          "A cinematic finance-fest platform engineered like a startup product, with live event intelligence, dynamic registrations, and premium digital storytelling.",
        primaryCta: "Explore Events",
        secondaryCta: "Register College",
        spotlightMetric: "11 flagship competitions"
      }
    }
  });

  const pageSections = [
    {
      pageSlug: "home",
      key: "narrative",
      title: "Commerce reimagined as a live operating system",
      body: "The platform fuses registrations, event operations, announcements, analytics, and approvals into one luxury-grade digital experience for students, faculty, and organizers.",
      accent: "#2FFFD6",
      sortOrder: 1
    },
    {
      pageSlug: "home",
      key: "capabilities",
      title: "Built for motion, scale, and control",
      body: "Every section, visual, sponsor block, judge panel, and rulebook is managed dynamically through the backend workflow, with audit trails and version history for every change.",
      accent: "#6EE7FF",
      sortOrder: 2
    },
    {
      pageSlug: "organising-team",
      key: "mission",
      title: "A management core built like a product team",
      body: "Finance society leaders, faculty advisors, and ops specialists collaborate through approval flows, media uploads, and role-based content publishing.",
      accent: "#FFBF6E",
      sortOrder: 1
    },
    {
      pageSlug: "contact",
      key: "support",
      title: "Direct channels for partnership and participation",
      body: "Colleges, sponsors, judges, and participants can reach the team through dedicated operations, event, and sponsorship lines.",
      accent: "#A6FF7D",
      sortOrder: 1
    }
  ];

  for (const section of pageSections) {
    await prisma.pageSection.upsert({
      where: { pageSlug_key: { pageSlug: section.pageSlug, key: section.key } },
      update: section,
      create: section
    });
  }

  const teamMembers = [
    ["Aarav Mehta", "Festival Director", "Core Strategy", "director@finastrafest.in"],
    ["Riya Kapoor", "Head of Events", "Programming", "events@finastrafest.in"],
    ["Kabir Shah", "Sponsorship Lead", "Partnerships", "partners@finastrafest.in"],
    ["Ishita Verma", "Operations Lead", "Campus Ops", "ops@finastrafest.in"]
  ];

  await prisma.teamMember.deleteMany();
  for (const [index, member] of teamMembers.entries()) {
    await prisma.teamMember.create({
      data: {
        name: member[0],
        title: member[1],
        division: member[2],
        email: member[3],
        linkedinUrl: "https://www.linkedin.com/company/finastrafest",
        sortOrder: index + 1
      }
    });
  }

  await prisma.contactChannel.deleteMany();
  const channels = [
    ["General Inquiries", "hello@finastrafest.in", "mailto:hello@finastrafest.in"],
    ["Event Desk", "+91 98765 43210", "tel:+919876543210"],
    ["Sponsorship Desk", "partners@finastrafest.in", "mailto:partners@finastrafest.in"],
    ["Instagram", "@finastrafest", "https://instagram.com/finastrafest"]
  ];

  for (const [index, channel] of channels.entries()) {
    await prisma.contactChannel.create({
      data: {
        label: channel[0],
        value: channel[1],
        href: channel[2],
        sortOrder: index + 1
      }
    });
  }
}

async function seedForms() {
  const forms = [
    {
      slug: "college-register",
      title: "College Register",
      description: "Register your institution, faculty coordinator, and CR nomination.",
      submitLabel: "Submit College Profile",
      successMessage: "College registration is under review.",
      fields: [
        ["collegeName", "College Name", "text", true],
        ["collegeCity", "City", "text", true],
        ["facultyName", "Faculty Coordinator Name", "text", true],
        ["facultyEmail", "Faculty Coordinator Email", "email", true],
        ["facultyPhone", "Faculty Coordinator Phone", "tel", true],
        ["crNomineeName", "CR Nominee Name", "text", true],
        ["crNomineeEmail", "CR Nominee Email", "email", true],
        ["crNomineePhone", "CR Nominee Phone", "tel", true]
      ]
    },
    {
      slug: "cr-register",
      title: "CR Register",
      description: "Verify the nominated campus representative and generate credentials.",
      submitLabel: "Submit CR Profile",
      successMessage: "CR profile has been queued for verification.",
      fields: [
        ["collegeId", "College", "select", true],
        ["fullName", "Full Name", "text", true],
        ["email", "Email Address", "email", true],
        ["phone", "Phone Number", "tel", true],
        ["enrollmentId", "Enrollment ID", "text", true]
      ]
    },
    {
      slug: "team-pre-registration",
      title: "Team Pre-Registration",
      description: "Create your team, attach participants, and select the event you want to enter.",
      submitLabel: "Create Team Registration",
      successMessage: "Team pre-registration submitted successfully.",
      fields: [
        ["teamName", "Team Name", "text", true],
        ["collegeId", "College", "select", true],
        ["eventId", "Event", "select", true],
        ["leaderName", "Team Leader", "text", true],
        ["leaderEmail", "Leader Email", "email", true],
        ["leaderPhone", "Leader Phone", "tel", true],
        ["specialRequirements", "Special Requirements", "textarea", false]
      ]
    }
  ];

  for (const form of forms) {
    const savedForm = await prisma.dynamicForm.upsert({
      where: { slug: form.slug },
      update: {
        title: form.title,
        description: form.description,
        submitLabel: form.submitLabel,
        successMessage: form.successMessage
      },
      create: {
        slug: form.slug,
        title: form.title,
        description: form.description,
        submitLabel: form.submitLabel,
        successMessage: form.successMessage
      }
    });

    await prisma.dynamicFormField.deleteMany({
      where: { formId: savedForm.id }
    });

    for (const [index, field] of form.fields.entries()) {
      await prisma.dynamicFormField.create({
        data: {
          formId: savedForm.id,
          name: field[0],
          label: field[1],
          type: field[2] as never,
          required: field[3],
          sortOrder: index + 1,
          options:
            field[0] === "collegeId"
              ? { source: "colleges" }
              : field[0] === "eventId"
                ? { source: "events" }
                : null
        }
      });
    }
  }
}

async function seedEvents(adminId: string) {
  await prisma.event.deleteMany();

  for (const [index, [slug, name, tagline]] of eventBlueprints.entries()) {
    const event = await prisma.event.create({
      data: {
        slug,
        name,
        tagline,
        category: index % 2 === 0 ? "Strategy" : "Finance",
        shortDescription: `${name} is a premium, high-pressure challenge crafted for commerce and finance leaders.`,
        longDescription:
          `${name} blends analytical rigor, storytelling clarity, and boardroom-grade decision making in a festival environment designed to feel like a live capital markets product.`,
        venue: index % 3 === 0 ? "Central Convention Hall" : "Innovation Arena",
        mode: index % 3 === 0 ? "OFFLINE" : index % 3 === 1 ? "HYBRID" : "ONLINE",
        accent: ["#2FFFD6", "#6EE7FF", "#FFBF6E", "#A6FF7D"][index % 4],
        participantLimit: 120,
        minTeamSize: 2,
        maxTeamSize: 4,
        registrationStatus: "OPEN",
        workflowStatus: "PUBLISHED",
        countdownTo: new Date("2026-09-25T09:00:00.000Z"),
        createdById: adminId,
        updatedById: adminId,
        sections: {
          create: [
            {
              key: "intro",
              title: "Event Intro",
              content: `Inside ${name}, teams operate through fast market signals, high-stakes judgment, and premium presentation design.`,
              sortOrder: 1
            },
            {
              key: "why-it-matters",
              title: "Why It Matters",
              content: "Participants translate commerce theory into execution, investor-grade clarity, and public-stage confidence.",
              sortOrder: 2
            }
          ]
        },
        rules: {
          create: [
            {
              title: "Original work only",
              description: "All decks, analysis, and submissions must be original and attributable to the registered team.",
              sortOrder: 1
            },
            {
              title: "Time-boxed rounds",
              description: "Late submissions are penalized unless approved by the event control desk.",
              sortOrder: 2
            }
          ]
        },
        rounds: {
          create: [
            {
              title: "Qualifier",
              sequence: 1,
              summary: "Rapid problem framing and insight extraction.",
              judgingFocus: "Clarity, speed, and commercial reasoning",
              startsAt: new Date("2026-09-25T10:00:00.000Z")
            },
            {
              title: "Finale",
              sequence: 2,
              summary: "Boardroom pitch to the jury with Q&A.",
              judgingFocus: "Conviction, polish, and defendability",
              startsAt: new Date("2026-09-26T15:00:00.000Z")
            }
          ]
        },
        faqs: {
          create: [
            {
              question: "Is this event open to first-year students?",
              answer: "Yes, as long as your college confirms eligibility and team composition rules are met.",
              sortOrder: 1
            },
            {
              question: "Can one participant join multiple teams?",
              answer: "No. A participant may appear in only one active team for the same event cycle.",
              sortOrder: 2
            }
          ]
        },
        coordinators: {
          create: [
            {
              name: "Riya Kapoor",
              role: "Event Lead",
              email: "events@finastrafest.in",
              phone: "+91 99887 77665"
            },
            {
              name: "Kabir Shah",
              role: "Operations Coordinator",
              email: "ops@finastrafest.in",
              phone: "+91 98765 43210"
            }
          ]
        },
        prizes: {
          create: [
            { label: "Winner", value: "INR 25,000" },
            { label: "Runner-Up", value: "INR 12,000" }
          ]
        },
        schedules: {
          create: [
            {
              label: "Registration Window",
              description: "Primary registration and verification cycle.",
              startsAt: new Date("2026-08-20T09:00:00.000Z"),
              venue: "Digital"
            },
            {
              label: "Event Day",
              description: "Live competition floor opens.",
              startsAt: new Date("2026-09-25T09:00:00.000Z"),
              venue: "Main Campus"
            }
          ]
        },
        judgingCriteria: {
          create: [
            {
              title: "Commercial depth",
              description: "Strength of finance, commerce, or market thinking.",
              weightage: 40
            },
            {
              title: "Presentation craft",
              description: "Narrative, visual polish, and clarity under questioning.",
              weightage: 30
            },
            {
              title: "Execution viability",
              description: "Realism, feasibility, and strategic conviction.",
              weightage: 30
            }
          ]
        },
        downloads: {
          create: [
            {
              title: "Official Rulebook",
              url: `https://cdn.finastrafest.in/rulebooks/${slug}.pdf`,
              kind: "RULEBOOK"
            }
          ]
        },
        announcements: {
          create: [
            {
              title: `${name} registrations are live`,
              body: "Early college submissions unlock faster review and priority support.",
              tone: "SUCCESS",
              publishedAt: new Date()
            }
          ]
        }
      }
    });

    const sponsor = await prisma.sponsor.create({
      data: {
        name: `${name} Capital Partner`,
        tier: "Powered By",
        websiteUrl: "https://finastrafest.in"
      }
    });

    await prisma.eventSponsor.create({
      data: {
        eventId: event.id,
        sponsorId: sponsor.id,
        sortOrder: 1
      }
    });
  }
}

async function seedCollegesAndRegistrations(superAdminId: string) {
  await prisma.college.deleteMany();

  const colleges = [
    ["Stellar Commerce College", "SCC01", "Mumbai", "Maharashtra"],
    ["National Institute of Finance", "NIF02", "Bengaluru", "Karnataka"],
    ["Artha Business School", "ABS03", "Delhi", "Delhi"],
    ["East Gate Commerce Academy", "EGC04", "Kolkata", "West Bengal"]
  ];

  const savedColleges = [];
  for (const [name, code, city, state] of colleges) {
    const college = await prisma.college.create({
      data: {
        name,
        code,
        city,
        state,
        website: "https://college.example.com",
        facultyCoordinator: "Faculty Lead",
        facultyCoordinatorEmail: "faculty@example.com",
        facultyCoordinatorPhone: "+91 98765 00000"
      }
    });
    savedColleges.push(college);
  }

  const crPasswordHash = await bcrypt.hash("CR@2026!", 10);

  for (const [index, college] of savedColleges.entries()) {
    const crUser = await prisma.user.create({
      data: {
        name: `CR ${index + 1}`,
        email: `cr${index + 1}@finastrafest.in`,
        passwordHash: crPasswordHash,
        role: "CAMPUS_REPRESENTATIVE",
        collegeId: college.id
      }
    });

    await prisma.campusRepresentative.create({
      data: {
        userId: crUser.id,
        collegeId: college.id,
        enrollmentId: `ENR-2026-${index + 101}`,
        status: "APPROVED",
        verifiedAt: new Date()
      }
    });

    await prisma.collegeRegistration.create({
      data: {
        collegeId: college.id,
        collegeName: college.name,
        facultyName: "Faculty Lead",
        facultyEmail: "faculty@example.com",
        facultyPhone: "+91 99999 99999",
        crNomineeName: crUser.name,
        crNomineeEmail: crUser.email,
        crNomineePhone: "+91 98888 88888",
        status: "APPROVED",
        paymentStatus: "PAID",
        submittedById: superAdminId
      }
    });

    await prisma.crRegistration.create({
      data: {
        collegeId: college.id,
        fullName: crUser.name,
        email: crUser.email,
        phone: "+91 98888 88888",
        enrollmentId: `ENR-2026-${index + 101}`,
        generatedUsername: `cr${index + 1}`,
        generatedPasswordHash: crPasswordHash,
        status: "APPROVED",
        submittedById: superAdminId
      }
    });
  }

  const events = await prisma.event.findMany();
  for (const [index, event] of events.slice(0, 6).entries()) {
    const college = savedColleges[index % savedColleges.length];
    const team = await prisma.team.create({
      data: {
        name: `Alpha Capital ${index + 1}`,
        code: `TEAM-${index + 1}-${college.code}`,
        leaderName: `Leader ${index + 1}`,
        leaderEmail: `leader${index + 1}@example.com`,
        leaderPhone: "+91 90000 00000",
        size: 3,
        collegeId: college.id,
        createdById: superAdminId,
        participants: {
          create: [
            {
              fullName: `Leader ${index + 1}`,
              email: `leader${index + 1}@example.com`,
              phone: "+91 90000 00000",
              department: "B.Com",
              yearOfStudy: "3",
              isLeader: true,
              qrCodeValue: `QR-${index + 1}-1`
            },
            {
              fullName: `Analyst ${index + 1}A`,
              email: `analyst${index + 1}a@example.com`,
              phone: "+91 91111 11111",
              department: "BBA",
              yearOfStudy: "2",
              qrCodeValue: `QR-${index + 1}-2`
            },
            {
              fullName: `Analyst ${index + 1}B`,
              email: `analyst${index + 1}b@example.com`,
              phone: "+91 92222 22222",
              department: "B.Com",
              yearOfStudy: "1",
              qrCodeValue: `QR-${index + 1}-3`
            }
          ]
        }
      }
    });

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        teamId: team.id,
        collegeId: college.id,
        submittedById: superAdminId,
        status: "APPROVED",
        approvalStatus: "APPROVED",
        paymentStatus: "PAID",
        qrCodeValue: `REG-${index + 1}`
      }
    });

    await prisma.payment.create({
      data: {
        registrationId: registration.id,
        amount: 1500,
        reference: `PAY-${index + 1}`,
        status: "PAID",
        verifiedById: superAdminId,
        paidAt: new Date()
      }
    });

    await prisma.leaderboardEntry.create({
      data: {
        eventId: event.id,
        eventRegistrationId: registration.id,
        score: 85 + index,
        rank: index + 1,
        remarks: "Strong market thesis and delivery."
      }
    });
  }
}

async function seedUsers() {
  const superAdminPassword = await bcrypt.hash("SuperAdmin@2026", 10);
  const teamAdminPassword = await bcrypt.hash("TeamAdmin@2026", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@finastrafest.in" },
    update: {
      name: "Super Admin",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN"
    },
    create: {
      name: "Super Admin",
      email: "superadmin@finastrafest.in",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN"
    }
  });

  const teamAdmin = await prisma.user.upsert({
    where: { email: "teamadmin@finastrafest.in" },
    update: {
      name: "Team Admin",
      passwordHash: teamAdminPassword,
      role: "TEAM_ADMIN"
    },
    create: {
      name: "Team Admin",
      email: "teamadmin@finastrafest.in",
      passwordHash: teamAdminPassword,
      role: "TEAM_ADMIN"
    }
  });

  return { superAdmin, teamAdmin };
}

async function main() {
  await prisma.$transaction([
    prisma.contentVersion.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.exportJob.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.approvalRequest.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.leaderboardEntry.deleteMany(),
    prisma.attendanceScan.deleteMany(),
    prisma.eventRegistration.deleteMany(),
    prisma.participant.deleteMany(),
    prisma.team.deleteMany(),
    prisma.eventSponsor.deleteMany(),
    prisma.sponsor.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.eventDownload.deleteMany(),
    prisma.eventJudgingCriterion.deleteMany(),
    prisma.eventSchedule.deleteMany(),
    prisma.eventPrize.deleteMany(),
    prisma.eventCoordinator.deleteMany(),
    prisma.eventFaq.deleteMany(),
    prisma.eventRound.deleteMany(),
    prisma.eventRule.deleteMany(),
    prisma.eventSection.deleteMany(),
    prisma.eventAdminAssignment.deleteMany(),
    prisma.event.deleteMany(),
    prisma.dynamicFormField.deleteMany(),
    prisma.dynamicForm.deleteMany(),
    prisma.contactChannel.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.pageSection.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.crRegistration.deleteMany(),
    prisma.collegeRegistration.deleteMany(),
    prisma.campusRepresentative.deleteMany(),
    prisma.user.deleteMany({
      where: {
        role: {
          in: ["CAMPUS_REPRESENTATIVE", "PARTICIPANT"]
        }
      }
    })
  ]);

  const { superAdmin, teamAdmin } = await seedUsers();
  await seedPermissions();
  await seedSiteContent();
  await seedForms();
  await seedEvents(superAdmin.id);
  await seedCollegesAndRegistrations(superAdmin.id);

  const flagshipEvent = await prisma.event.findFirst({
    where: { slug: "market-masters" }
  });

  if (flagshipEvent) {
    await prisma.eventAdminAssignment.create({
      data: {
        eventId: flagshipEvent.id,
        userId: teamAdmin.id,
        scope: "CONTENT_AND_REGISTRATIONS"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
