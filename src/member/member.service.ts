import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
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
      throw new Error('No data returned from database');
    }

    return data;
  }

  async findAll(): Promise<Member[]> {
  const { data, error } = await this.supabase
    .from('members')
    .select('*');

  if (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }

  if (!data) {
    throw new HttpException('No data returned from database', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return data;
}


  async findOne(id: string) : Promise<Member> {
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

  update(id: string, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: string) {
    return `This action removes a #${id} member`;
  }
}
