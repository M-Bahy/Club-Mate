import {
  IsString,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { SubscriptionType } from '../enums/subscription-type.enum';

export class CreateSubscriptionDto {
    @IsUUID()
    memberId: string;
    
    @IsUUID()
    sportId: string;
    
    @IsDateString()
    subscriptionDate: Date;
    
    @IsEnum(SubscriptionType)
    subscriptionType: SubscriptionType;
}
