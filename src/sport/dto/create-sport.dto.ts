import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class CreateSportDto {
    @IsString()
    name: string;
    
    @IsNumber()
    @IsPositive()
    price: number;
    
    @IsEnum(Gender)
    allowedGender: Gender;
}
