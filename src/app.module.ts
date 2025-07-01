import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { MemberModule } from './member/member.module';
import { SportModule } from './sport/sport.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    MemberModule,
    SportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
