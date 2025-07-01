import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {SupabaseService} from '../supabase/supabase.service';
import { log } from 'console';

@Injectable()
export class MemberService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createMemberDto: CreateMemberDto) {
    log('Creating member with data:', createMemberDto);
    const supabase = this.supabaseService.getClient();
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    const { data, error } = await supabase
      .from('members')
      .insert([createMemberDto])
      .select();
      // .single();
    log('Supabase response:', { data, error });
    if (error) {
      log('Database error:', error);
      throw new Error(error.message);
    }

    return data && data.length > 0 ? data[0] : null;
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
