import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SportService } from './sport.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { Sport } from './entities/sport.entity';

@Controller('sports')
export class SportController {
  constructor(private readonly sportService: SportService) {}

  @Post()
  create(@Body() createSportDto: CreateSportDto) : Promise<Sport> {
    return this.sportService.create(createSportDto);
  }

  @Get()
  findAll() : Promise<Sport[]> {
    return this.sportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) : Promise<Sport> {
    return this.sportService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSportDto: UpdateSportDto) : Promise<Sport> {
    return this.sportService.update(id, updateSportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) : Promise<string> {
    return this.sportService.remove(id);
  }
}
