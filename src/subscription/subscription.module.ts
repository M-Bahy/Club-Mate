import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { MemberModule } from '../member/member.module';
import { SportModule } from '../sport/sport.module';

@Module({
  imports: [SupabaseModule, MemberModule, SportModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
