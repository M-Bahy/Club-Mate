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

  async subscribe(createSubscriptionDto: CreateSubscriptionDto) {
    // DB constrains already in place to check that the member and sport exists
    // and check that their combination is unique, so no need to add additional checks here.
    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert([createSubscriptionDto])
      .select()
      .single();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (!data) {
      throw new HttpException(
        'No data returned from database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*');

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!data) {
      throw new HttpException('No subscriptions found', HttpStatus.NOT_FOUND);
    }

    return data;
  }

  async findOne(id: string) {
    return `This action returns a #${id} subscription`;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    return `This action updates a #${id} subscription`;
  }

  async unsubscribe(id: string) {
    return `This action removes a #${id} subscription`;
  }
}
