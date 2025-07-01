import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberService {
  private supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {}

  onModuleInit() {
    this.supabase = this.supabaseService.getClient();
    if (!this.supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
  }

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const { data, error } = await this.supabase
      .from('members')
      .insert([createMemberDto])
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

  async findAll(): Promise<Member[]> {
    const { data, error } = await this.supabase.from('members').select('*');

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

  async findOne(id: string): Promise<Member> {
    const { data, error } = await this.supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }

    if (!data) {
      throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
    }

    return data;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const { data, error } = await this.supabase
      .from('members')
      .update(updateMemberDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (!data) {
      throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
    }

    return data;
  }

  async remove(id: string): Promise<string> {
    const { error } = await this.supabase.from('members').delete().eq('id', id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return `Member with id ${id} removed successfully`;
  }
}
