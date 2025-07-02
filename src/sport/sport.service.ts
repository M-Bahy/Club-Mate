import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Sport } from './entities/sport.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SportService {
  private supabase: SupabaseClient;
  private readonly CACHE_KEY = 'sports:all';
  private readonly CACHE_TTL = 300000; // 5 minutes in milliseconds

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  onModuleInit() {
    this.supabase = this.supabaseService.getClient();
    if (!this.supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
  }

  async create(createSportDto: CreateSportDto): Promise<Sport> {
    const { data, error } = await this.supabase
      .from('sports')
      .insert([createSportDto])
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
    // Invalidate cache after creating a new sport to ensure fresh data
    await this.cacheManager.del(this.CACHE_KEY);

    return data;
  }

  async findAll(): Promise<Sport[]> {
    const cached = await this.cacheManager.get<Sport[]>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    const { data, error } = await this.supabase.from('sports').select();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (!data) {
      throw new HttpException(
        'No data returned from database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.cacheManager.set(this.CACHE_KEY, data, this.CACHE_TTL);
    return data;
  }

  async update(id: string, updateSportDto: UpdateSportDto): Promise<Sport> {
    const { data, error } = await this.supabase
      .from('sports')
      .update(updateSportDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (!data) {
      throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
    }
    await this.cacheManager.del(this.CACHE_KEY);
    return data;
  }

  async remove(id: string): Promise<Sport> {
    const { data, error } = await this.supabase
      .from('sports')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Supabase: No rows found
        throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    await this.cacheManager.del(this.CACHE_KEY);
    return data;
  }

  async findOne(id: string): Promise<Sport> {
    const { data, error } = await this.supabase
      .from('sports')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }

    if (!data) {
      throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
    }

    return data;
  }
}
