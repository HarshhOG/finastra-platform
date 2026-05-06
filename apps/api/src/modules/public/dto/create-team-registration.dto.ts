import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

class ParticipantDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  department!: string;

  @IsString()
  yearOfStudy!: string;
}

export class CreateTeamRegistrationDto {
  @IsString()
  teamName!: string;

  @IsString()
  collegeId!: string;

  @IsString()
  eventId!: string;

  @IsString()
  leaderName!: string;

  @IsEmail()
  leaderEmail!: string;

  @IsString()
  leaderPhone!: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants!: ParticipantDto[];
}
