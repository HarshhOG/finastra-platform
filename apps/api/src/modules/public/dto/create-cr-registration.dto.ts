import { IsEmail, IsString } from "class-validator";

export class CreateCrRegistrationDto {
  @IsString()
  collegeId!: string;

  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  enrollmentId!: string;
}
