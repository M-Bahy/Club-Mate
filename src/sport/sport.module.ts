import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { SportService } from './sport.service';
import { SportController } from './sport.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    SupabaseModule,
    CacheModule.register({
      ttl: 300000, // 5 minutes in milliseconds
    }),
  ],
  controllers: [SportController],
  providers: [SportService],
})
export class SportModule {}
