import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {}
  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || "https://pcicotairfkzetymfffs.supabase.co";
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjaWNvdGFpcmZremV0eW1mZmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTk5MzIsImV4cCI6MjA2Njg5NTkzMn0.6d9SizvSgRrfMQQXYMctKkLquq132-UVPaf6Z7pwgAw";

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
