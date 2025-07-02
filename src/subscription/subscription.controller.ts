import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { Subscription } from './entities/subscription.entity';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) : Promise<Subscription> {
    return this.subscriptionService.subscribe(createSubscriptionDto);
  }

  @Get()
  findAll() : Promise<Subscription[]> {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Patch()
  update(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) : Promise<Subscription> {
    return this.subscriptionService.update(updateSubscriptionDto);
  }

  @Delete()
  remove(@Body() unsubscribeDto: UnsubscribeDto) : Promise<string> {
    return this.subscriptionService.unsubscribe(unsubscribeDto);
  }
}
