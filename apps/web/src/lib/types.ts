import type {
  AnnouncementItem,
  ContactChannel,
  DynamicFormDefinition,
  EventCard,
  EventDetail,
  HeroContent,
  SitePageSection,
  TeamMemberCard
} from "@finastra/types";

export interface SiteExperiencePayload {
  hero: HeroContent;
  sections: SitePageSection[];
  stats: Array<{
    label: string;
    value: number;
  }>;
  featuredEvents: EventCard[];
  announcements: AnnouncementItem[];
}

export interface TeamPayload {
  sections: SitePageSection[];
  members: TeamMemberCard[];
}

export interface ContactPayload {
  sections: SitePageSection[];
  channels: ContactChannel[];
}

export type EventCollectionPayload = EventCard[];
export type EventDetailPayload = EventDetail;
export type DynamicFormPayload = DynamicFormDefinition;
