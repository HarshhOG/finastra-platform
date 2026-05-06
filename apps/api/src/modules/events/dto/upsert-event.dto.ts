import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from "class-validator";

export class UpsertEventDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  mode?: "ONLINE" | "OFFLINE" | "HYBRID";

  @IsOptional()
  @IsString()
  accent?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  participantLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  minTeamSize?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxTeamSize?: number;

  @IsOptional()
  @IsString()
  registrationStatus?: "UPCOMING" | "OPEN" | "CLOSED" | "WAITLIST";

  @IsOptional()
  @IsDateString()
  countdownTo?: string;

  @IsOptional()
  @IsArray()
  sections?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  rules?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  rounds?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  faqs?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  coordinators?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  prizes?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  schedules?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  judgingCriteria?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  downloads?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  announcements?: Array<Record<string, unknown>>;
}
