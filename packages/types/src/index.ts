export const userRoles = [
  "SUPER_ADMIN",
  "TEAM_ADMIN",
  "FACULTY_COORDINATOR",
  "CAMPUS_REPRESENTATIVE",
  "PARTICIPANT"
] as const;

export type UserRole = (typeof userRoles)[number];

export const approvalStatuses = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PUBLISHED"
] as const;

export type ApprovalStatus = (typeof approvalStatuses)[number];

export const registrationStatuses = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "WAITLISTED"
] as const;

export type RegistrationStatus = (typeof registrationStatuses)[number];

export const paymentStatuses = [
  "PENDING",
  "REQUIRES_VERIFICATION",
  "PAID",
  "FAILED",
  "REFUNDED"
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export interface RichMediaAsset {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  altText?: string | null;
  blurDataUrl?: string | null;
}

export interface SponsorCard {
  id: string;
  name: string;
  tier: string;
  websiteUrl?: string | null;
  logo?: RichMediaAsset | null;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  tone: "INFO" | "ALERT" | "SUCCESS";
  publishedAt: string;
}

export interface EventCard {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  shortDescription: string;
  heroAsset?: RichMediaAsset | null;
  accent: string;
  participantLimit: number;
  minTeamSize: number;
  maxTeamSize: number;
  registrationStatus: RegistrationStatus;
  countdownTo?: string | null;
}

export interface EventRule {
  id: string;
  title: string;
  description: string;
}

export interface EventRound {
  id: string;
  title: string;
  sequence: number;
  summary: string;
  judgingFocus: string;
  startsAt?: string | null;
}

export interface EventFaq {
  id: string;
  question: string;
  answer: string;
}

export interface EventCoordinator {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface EventPrizePool {
  id: string;
  label: string;
  value: string;
}

export interface EventScheduleItem {
  id: string;
  label: string;
  description: string;
  startsAt: string;
  venue: string;
}

export interface EventJudgeCriteria {
  id: string;
  title: string;
  description: string;
  weightage: number;
}

export interface EventDownload {
  id: string;
  title: string;
  url: string;
  kind: "BROCHURE" | "RULEBOOK" | "TEMPLATE" | "CERTIFICATE";
}

export interface EventDetail extends EventCard {
  longDescription: string;
  venue: string;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  sections: Array<{
    id: string;
    key: string;
    title: string;
    content: string;
  }>;
  rules: EventRule[];
  rounds: EventRound[];
  faqs: EventFaq[];
  coordinators: EventCoordinator[];
  prizes: EventPrizePool[];
  schedules: EventScheduleItem[];
  judgingCriteria: EventJudgeCriteria[];
  downloads: EventDownload[];
  sponsors: SponsorCard[];
  gallery: RichMediaAsset[];
  announcements: AnnouncementItem[];
}

export interface DynamicFormFieldOption {
  label: string;
  value: string;
}

export interface DynamicFormField {
  id: string;
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "textarea"
    | "number"
    | "select"
    | "date"
    | "file";
  placeholder?: string | null;
  required: boolean;
  helperText?: string | null;
  validationRule?: string | null;
  options?: DynamicFormFieldOption[];
}

export interface DynamicFormDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  fields: DynamicFormField[];
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  spotlightMetric: string;
}

export interface SitePageSection {
  id: string;
  key: string;
  title: string;
  body: string;
  accent?: string | null;
}

export interface TeamMemberCard {
  id: string;
  name: string;
  title: string;
  division: string;
  email: string;
  linkedinUrl?: string | null;
  avatar?: RichMediaAsset | null;
}

export interface ContactChannel {
  id: string;
  label: string;
  value: string;
  href: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  trend: "UP" | "DOWN" | "NEUTRAL";
}

export interface DashboardChartPoint {
  label: string;
  value: number;
}

export interface DashboardOverview {
  metrics: DashboardMetric[];
  registrationsByEvent: DashboardChartPoint[];
  registrationsByCollege: DashboardChartPoint[];
  approvalLoad: DashboardChartPoint[];
  liveHeadline: string;
}

export interface ApprovalDiffField {
  field: string;
  before: string | null;
  after: string | null;
}

export interface ApprovalRequestView {
  id: string;
  entityType: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  submittedBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  status: ApprovalStatus;
  requestedAt: string;
  diff: ApprovalDiffField[];
}
