-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'TEAM_ADMIN', 'FACULTY_COORDINATOR', 'CAMPUS_REPRESENTATIVE', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "RegistrationWindowStatus" AS ENUM ('UPCOMING', 'OPEN', 'CLOSED', 'WAITLIST');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'REQUIRES_VERIFICATION', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "EventMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "AnnouncementTone" AS ENUM ('INFO', 'ALERT', 'SUCCESS');

-- CreateEnum
CREATE TYPE "ChangeAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('QUEUED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DynamicFieldType" AS ENUM ('text', 'email', 'tel', 'textarea', 'number', 'select', 'date', 'file');

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PARTICIPANT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "refreshTokenHash" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "collegeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "website" TEXT,
    "facultyCoordinator" TEXT,
    "facultyCoordinatorEmail" TEXT,
    "facultyCoordinatorPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusRepresentative" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'APPROVED',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampusRepresentative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSection" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "accent" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "avatarId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactChannel" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicForm" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "submitLabel" TEXT NOT NULL,
    "successMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicFormField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "DynamicFieldType" NOT NULL,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "helperText" TEXT,
    "validationRule" TEXT,
    "options" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DynamicFormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "altText" TEXT,
    "blurDataUrl" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "logoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "mode" "EventMode" NOT NULL,
    "accent" TEXT NOT NULL,
    "participantLimit" INTEGER NOT NULL,
    "minTeamSize" INTEGER NOT NULL,
    "maxTeamSize" INTEGER NOT NULL,
    "workflowStatus" "ApprovalStatus" NOT NULL DEFAULT 'PUBLISHED',
    "registrationStatus" "RegistrationWindowStatus" NOT NULL DEFAULT 'OPEN',
    "countdownTo" TIMESTAMP(3),
    "heroAssetId" TEXT,
    "bannerAssetId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSection" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRule" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRound" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "judgingFocus" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),

    CONSTRAINT "EventRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFaq" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCoordinator" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "EventCoordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPrize" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "EventPrize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSchedule" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,

    CONSTRAINT "EventSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventJudgingCriterion" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weightage" INTEGER NOT NULL,

    CONSTRAINT "EventJudgingCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDownload" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL,

    CONSTRAINT "EventDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSponsor" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventGalleryAsset" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventGalleryAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tone" "AnnouncementTone" NOT NULL DEFAULT 'INFO',
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "leaderName" TEXT NOT NULL,
    "leaderEmail" TEXT NOT NULL,
    "leaderPhone" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "specialRequirements" TEXT,
    "collegeId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "yearOfStudy" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "qrCodeValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "submittedById" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "qrCodeValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "reference" TEXT NOT NULL,
    "proofUrl" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedById" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "ChangeAction" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "beforeSnapshot" JSONB,
    "afterSnapshot" JSONB,
    "diff" JSONB NOT NULL,
    "notes" TEXT,
    "submittedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" JSONB,
    "status" "ExportStatus" NOT NULL DEFAULT 'QUEUED',
    "downloadUrl" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceScan" (
    "id" TEXT NOT NULL,
    "eventRegistrationId" TEXT NOT NULL,
    "participantId" TEXT,
    "scannedById" TEXT,
    "checkpoint" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventRegistrationId" TEXT NOT NULL,
    "score" DECIMAL(6,2) NOT NULL,
    "rank" INTEGER NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAdminAssignment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAdminAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeRegistration" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT,
    "collegeName" TEXT NOT NULL,
    "collegeCity" TEXT,
    "collegeState" TEXT,
    "facultyName" TEXT NOT NULL,
    "facultyEmail" TEXT NOT NULL,
    "facultyPhone" TEXT NOT NULL,
    "crNomineeName" TEXT NOT NULL,
    "crNomineeEmail" TEXT NOT NULL,
    "crNomineePhone" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "submittedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrRegistration" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "generatedUsername" TEXT,
    "generatedPasswordHash" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_permissionId_key" ON "RolePermission"("role", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "College_code_key" ON "College"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CampusRepresentative_userId_key" ON "CampusRepresentative"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PageSection_pageSlug_key_key" ON "PageSection"("pageSlug", "key");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicForm_slug_key" ON "DynamicForm"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicFormField_formId_name_key" ON "DynamicFormField"("formId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EventSection_eventId_key_key" ON "EventSection"("eventId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "EventSponsor_eventId_sponsorId_key" ON "EventSponsor"("eventId", "sponsorId");

-- CreateIndex
CREATE UNIQUE INDEX "EventGalleryAsset_eventId_assetId_key" ON "EventGalleryAsset"("eventId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_code_key" ON "Team"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_eventId_eventRegistrationId_key" ON "LeaderboardEntry"("eventId", "eventRegistrationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_entityType_entityId_version_key" ON "ContentVersion"("entityType", "entityId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "EventAdminAssignment_eventId_userId_key" ON "EventAdminAssignment"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusRepresentative" ADD CONSTRAINT "CampusRepresentative_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusRepresentative" ADD CONSTRAINT "CampusRepresentative_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicFormField" ADD CONSTRAINT "DynamicFormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "DynamicForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_heroAssetId_fkey" FOREIGN KEY ("heroAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_bannerAssetId_fkey" FOREIGN KEY ("bannerAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSection" ADD CONSTRAINT "EventSection_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRule" ADD CONSTRAINT "EventRule_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRound" ADD CONSTRAINT "EventRound_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFaq" ADD CONSTRAINT "EventFaq_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCoordinator" ADD CONSTRAINT "EventCoordinator_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPrize" ADD CONSTRAINT "EventPrize_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSchedule" ADD CONSTRAINT "EventSchedule_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventJudgingCriterion" ADD CONSTRAINT "EventJudgingCriterion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDownload" ADD CONSTRAINT "EventDownload_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSponsor" ADD CONSTRAINT "EventSponsor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSponsor" ADD CONSTRAINT "EventSponsor_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGalleryAsset" ADD CONSTRAINT "EventGalleryAsset_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGalleryAsset" ADD CONSTRAINT "EventGalleryAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceScan" ADD CONSTRAINT "AttendanceScan_eventRegistrationId_fkey" FOREIGN KEY ("eventRegistrationId") REFERENCES "EventRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceScan" ADD CONSTRAINT "AttendanceScan_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceScan" ADD CONSTRAINT "AttendanceScan_scannedById_fkey" FOREIGN KEY ("scannedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_eventRegistrationId_fkey" FOREIGN KEY ("eventRegistrationId") REFERENCES "EventRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAdminAssignment" ADD CONSTRAINT "EventAdminAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAdminAssignment" ADD CONSTRAINT "EventAdminAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeRegistration" ADD CONSTRAINT "CollegeRegistration_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeRegistration" ADD CONSTRAINT "CollegeRegistration_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrRegistration" ADD CONSTRAINT "CrRegistration_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrRegistration" ADD CONSTRAINT "CrRegistration_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
