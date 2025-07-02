import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class CreateMemberDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  dob: string; // expected format: YYYY-MM-DD

  @IsUUID()
  @IsOptional()
  associatedMemberId?: string;
}
