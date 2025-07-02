import { IsUUID } from 'class-validator';

export class UnsubscribeDto {
  @IsUUID()
  memberId: string; // A Database-Level Constraint was added in supabase to cascade on update/delete

  @IsUUID()
  sportId: string; // A Database-Level Constraint was added in supabase to cascade on update/delete


}
