import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { log } from 'console';

@Injectable()
export class MemberService {

  private readonly supabase;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
    
  }

  async create(createMemberDto: CreateMemberDto) {

    const { data, error } = await this.supabase
      .from('members')
      .insert(createMemberDto)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No data returned from database');
    }

    return data;
  }

  findAll() {
    return `This action returns all member`;
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
