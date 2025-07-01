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


  findOne(id: number) {
    return `This action returns a #${id} member`;
  }

  update(id: number, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}
