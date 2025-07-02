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
import { Subscription } from './entities/subscription.entity';
import { UnsubscribeDto } from './dto/unsubscribe.dto';

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

  async subscribe(createSubscriptionDto: CreateSubscriptionDto) : Promise<Subscription> {
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

  async findAll() : Promise<Subscription[]> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select();

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!data) {
      throw new HttpException('No subscriptions found', HttpStatus.NOT_FOUND);
    }

    return data;
  }

  async findByMemberId(memberId: string) : Promise<Subscription[]> {
    
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select()
      .eq('memberId', memberId);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!data) {
      throw new HttpException(
        `No subscriptions found for member with ID ${memberId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return data;
  }

  async findBySportId(sportId: string) : Promise<Subscription[]> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select()
      .eq('sportId', sportId);

    if (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!data) {
      throw new HttpException(
        `No subscriptions found for sport with ID ${sportId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return data;
  }

  async update(updateSubscriptionDto: UpdateSubscriptionDto) : Promise<Subscription> {

    if (!updateSubscriptionDto.memberId || !updateSubscriptionDto.sportId) {
      throw new HttpException(
        'Member ID and Sport ID are required to update a subscription',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update(updateSubscriptionDto)
      .eq('memberId', updateSubscriptionDto.memberId)
      .eq('sportId', updateSubscriptionDto.sportId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Supabase: No rows found
        throw new HttpException(
          'No subscription found to update',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (!data) {
      throw new HttpException(
        'No subscription found to update',
        HttpStatus.NOT_FOUND,
      );
    }

    return data;
  }

  async unsubscribe(unsubscribeDto: UnsubscribeDto) : Promise<string> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .delete()
      .eq('memberId', unsubscribeDto.memberId)
      .eq('sportId', unsubscribeDto.sportId)  
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Supabase: No rows found
        return `Subscription for user with id ${unsubscribeDto.memberId} and sport with id ${unsubscribeDto.sportId} was not found, nothing to delete`;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return `User with id ${unsubscribeDto.memberId} unsubscribed from sport with id ${unsubscribeDto.sportId} successfully`;
  }
}
