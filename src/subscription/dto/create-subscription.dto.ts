import { IsString, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { SubscriptionType } from '../enums/subscription-type.enum';

export class CreateSubscriptionDto {
  @IsUUID()
  memberId: string; // A Database-Level Constraint was added in supabase to cascade on update/delete

  @IsUUID()
  sportId: string; // A Database-Level Constraint was added in supabase to cascade on update/delete

  @IsDateString()
  subscriptionDate: Date; // format: YYYY-MM-DD

  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType;
}
