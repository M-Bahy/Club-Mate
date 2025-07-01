import { Module } from '@nestjs/common';
import { SportService } from './sport.service';
import { SportController } from './sport.controller';
import { SupabaseModule } from '../supabase/supabase.module';


@Module({
  imports: [SupabaseModule],
  controllers: [SportController],
  providers: [SportService],
})
export class SportModule {}
