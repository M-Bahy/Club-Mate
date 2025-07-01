import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
  @Post()
  async create(@Body() createMemberDto: CreateMemberDto) : Promise<Member> {
    return this.memberService.create(createMemberDto);
  }
  @Get()
  findAll() : Promise<Member[]> {
    return this.memberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) : Promise<Member> {
    return this.memberService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) : Promise<Member> {
    return this.memberService.update(id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) : Promise<string> {
    return this.memberService.remove(id);
  }
}
