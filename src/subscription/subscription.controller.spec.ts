import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { SubscriptionType } from './enums/subscription-type.enum';
import { Subscription } from './entities/subscription.entity';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let subscriptionService: jest.Mocked<SubscriptionService>;

  const mockSubscription: Subscription = {
    memberId: '123e4567-e89b-12d3-a456-426614174000',
    sportId: '456e7890-e89b-12d3-a456-426614174000',
    subscriptionDate: new Date('2025-01-01'),
    subscriptionType: SubscriptionType.GROUP,
    member: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      gender: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    sport: {
      id: '456e7890-e89b-12d3-a456-426614174000',
      name: 'Football',
      price: 100,
      allowedGender: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
  };

  const mockSubscriptionService = {
    subscribe: jest.fn(),
    findAll: jest.fn(),
    findByMemberId: jest.fn(),
    findBySportId: jest.fn(),
    update: jest.fn(),
    unsubscribe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: mockSubscriptionService,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    subscriptionService = module.get(SubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a subscription', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        sportId: '456e7890-e89b-12d3-a456-426614174000',
        subscriptionDate: new Date('2025-01-01'),
        subscriptionType: SubscriptionType.GROUP,
      };

      subscriptionService.subscribe.mockResolvedValue(mockSubscription);

      const result = await controller.create(createSubscriptionDto);

      expect(subscriptionService.subscribe).toHaveBeenCalledWith(createSubscriptionDto);
      expect(result).toEqual(mockSubscription);
    });

    it('should throw error when service throws error', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        sportId: '456e7890-e89b-12d3-a456-426614174000',
        subscriptionDate: new Date('2025-01-01'),
        subscriptionType: SubscriptionType.GROUP,
      };

      const error = new Error('Service error');
      subscriptionService.subscribe.mockRejectedValue(error);

      await expect(controller.create(createSubscriptionDto)).rejects.toThrow(error);
      expect(subscriptionService.subscribe).toHaveBeenCalledWith(createSubscriptionDto);
    });
  });

  describe('findAll', () => {
    it('should return all subscriptions', async () => {
      const mockSubscriptions = [mockSubscription];
      subscriptionService.findAll.mockResolvedValue(mockSubscriptions);

      const result = await controller.findAll();

      expect(subscriptionService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSubscriptions);
    });

    it('should throw error when service throws error', async () => {
      const error = new Error('Service error');
      subscriptionService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(subscriptionService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return subscriptions for a member', async () => {
      const memberId = '123e4567-e89b-12d3-a456-426614174000';
      const mockSubscriptions = [mockSubscription];
      subscriptionService.findByMemberId.mockResolvedValue(mockSubscriptions);

      const result = await controller.findOne(memberId);

      expect(subscriptionService.findByMemberId).toHaveBeenCalledWith(memberId);
      expect(result).toEqual(mockSubscriptions);
    });

    it('should throw error when service throws error', async () => {
      const memberId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new Error('Service error');
      subscriptionService.findByMemberId.mockRejectedValue(error);

      await expect(controller.findOne(memberId)).rejects.toThrow(error);
      expect(subscriptionService.findByMemberId).toHaveBeenCalledWith(memberId);
    });
  });

  describe('findBySportId', () => {
    it('should return subscriptions for a sport', async () => {
      const sportId = '456e7890-e89b-12d3-a456-426614174000';
      const mockSubscriptions = [mockSubscription];
      subscriptionService.findBySportId.mockResolvedValue(mockSubscriptions);

      const result = await controller.findBySportId(sportId);

      expect(subscriptionService.findBySportId).toHaveBeenCalledWith(sportId);
      expect(result).toEqual(mockSubscriptions);
    });

    it('should throw error when service throws error', async () => {
      const sportId = '456e7890-e89b-12d3-a456-426614174000';
      const error = new Error('Service error');
      subscriptionService.findBySportId.mockRejectedValue(error);

      await expect(controller.findBySportId(sportId)).rejects.toThrow(error);
      expect(subscriptionService.findBySportId).toHaveBeenCalledWith(sportId);
    });
  });

  describe('update', () => {
    it('should update a subscription', async () => {
      const updateSubscriptionDto: UpdateSubscriptionDto = {
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        sportId: '456e7890-e89b-12d3-a456-426614174000',
        subscriptionType: SubscriptionType.PRIVATE,
      };

      const updatedSubscription = { ...mockSubscription, subscriptionType: SubscriptionType.PRIVATE };
      subscriptionService.update.mockResolvedValue(updatedSubscription);

      const result = await controller.update(updateSubscriptionDto);

      expect(subscriptionService.update).toHaveBeenCalledWith(updateSubscriptionDto);
      expect(result).toEqual(updatedSubscription);
    });

    it('should throw error when service throws error', async () => {
      const updateSubscriptionDto: UpdateSubscriptionDto = {
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        sportId: '456e7890-e89b-12d3-a456-426614174000',
        subscriptionType: SubscriptionType.PRIVATE,
      };

      const error = new Error('Service error');
      subscriptionService.update.mockRejectedValue(error);

      await expect(controller.update(updateSubscriptionDto)).rejects.toThrow(error);
      expect(subscriptionService.update).toHaveBeenCalledWith(updateSubscriptionDto);
    });
  });

  describe('remove', () => {
    it('should unsubscribe successfully', async () => {
      const unsubscribeDto: UnsubscribeDto = {
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        sportId: '456e7890-e89b-12d3-a456-426614174000',
      };

      const successMessage = 'User with id 123e4567-e89b-12d3-a456-426614174000 unsubscribed from sport with id 456e7890-e89b-12d3-a456-426614174000 successfully';
      subscriptionService.unsubscribe.mockResolvedValue(successMessage);

      const result = await controller.remove(unsubscribeDto);

      expect(subscriptionService.unsubscribe).toHaveBeenCalledWith(unsubscribeDto);
      expect(result).toBe(successMessage);
    });

    it('should throw error when service throws error', async () => {
      const unsubscribeDto: UnsubscribeDto = {
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        sportId: '456e7890-e89b-12d3-a456-426614174000',
      };

      const error = new Error('Service error');
      subscriptionService.unsubscribe.mockRejectedValue(error);

      await expect(controller.remove(unsubscribeDto)).rejects.toThrow(error);
      expect(subscriptionService.unsubscribe).toHaveBeenCalledWith(unsubscribeDto);
    });
  });
});
