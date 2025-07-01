import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Sport } from './entities/sport.entity';

@Injectable()
export class SportService {
  private supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {}

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

    return data;
  }

  async findAll(): Promise<Sport[]> {
    const { data, error } = await this.supabase.from('sports').select('*');

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

  async findOne(id: string): Promise<Sport> {
    const { data, error } = await this.supabase
      .from('sports')
      .select('*')
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

    return data;
  }

  async remove(id: string): Promise<string> {
    const { error } = await this.supabase.from('sports').delete().eq('id', id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return `Sport with id ${id} deleted successfully`;
  }
}
