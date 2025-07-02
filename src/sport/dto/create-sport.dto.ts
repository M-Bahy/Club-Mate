import { IsString, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class CreateSportDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number; // A constraint is also added in supabase to ensure the price is a positive number

  @IsEnum(Gender)
  allowedGender: Gender;
}
