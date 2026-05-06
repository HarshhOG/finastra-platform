import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateCollegeRegistrationDto {
  @IsString()
  collegeName!: string;

  @IsOptional()
  @IsString()
  collegeCity?: string;

  @IsOptional()
  @IsString()
  collegeState?: string;

  @IsString()
  facultyName!: string;

  @IsEmail()
  facultyEmail!: string;

  @IsString()
  facultyPhone!: string;

  @IsString()
  crNomineeName!: string;

  @IsEmail()
  crNomineeEmail!: string;

  @IsString()
  crNomineePhone!: string;
}
