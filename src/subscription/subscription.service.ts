import {
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { MemberService } from '../member/member.service';
import { SportService } from '../sport/sport.service';
import { SubscriptionType } from './enums/subscription-type.enum';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {

  private supabase: SupabaseClient;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly memberService: MemberService,
    private readonly sportService: SportService,
  ) {}

  onModuleInit() {
    this.supabase = this.supabaseService.getClient();
    if (!this.supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
  }

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    return 'This action adds a new subscription';
  }

  async findAll() {
    return `This action returns all subscription`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} subscription`;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    return `This action updates a #${id} subscription`;
  }

  async remove(id: string) {
    return `This action removes a #${id} subscription`;
  }
}
