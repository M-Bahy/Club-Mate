import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SupabaseService } from '../supabase/supabase.service';
import { MemberService } from '../member/member.service';
import { SportService } from '../sport/sport.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { SubscriptionType } from './enums/subscription-type.enum';
import { Member } from '../member/entities/member.entity';
import { Sport } from '../sport/entities/sport.entity';
import { Gender } from '../member/enums/gender.enum';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let supabaseService: jest.Mocked<SupabaseService>;
  let memberService: jest.Mocked<MemberService>;
  let sportService: jest.Mocked<SportService>;
  let mockSupabaseClient: any;

  const mockSubscription = {
    memberId: '123e4567-e89b-12d3-a456-426614174000',
    sportId: '456e7890-e89b-12d3-a456-426614174000',
    subscriptionDate: '2025-01-01',
    subscriptionType: SubscriptionType.GROUP,
    member: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe'
    },
    sport: {
      id: '456e7890-e89b-12d3-a456-426614174000',
      name: 'Football',
      price: 100
    }
  };

  const mockMember: Member = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    gender: Gender.MALE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSport: Sport = {
    id: '456e7890-e89b-12d3-a456-426614174000',
    name: 'Football',
    price: 100,
    allowedGender: Gender.MALE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockSupabaseQuery = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    mockSupabaseClient = mockSupabaseQuery;

    const mockSupabaseServiceInstance = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const mockMemberServiceInstance = {
      findOne: jest.fn(),
    };

    const mockSportServiceInstance = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseServiceInstance,
        },
        {
          provide: MemberService,
          useValue: mockMemberServiceInstance,
        },
        {
          provide: SportService,
          useValue: mockSportServiceInstance,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    supabaseService = module.get(SupabaseService);
    memberService = module.get(MemberService);
    sportService = module.get(SportService);

    // Trigger onModuleInit
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize supabase client successfully', () => {
      expect(supabaseService.getClient).toHaveBeenCalled();
    });

    it('should throw error if supabase client initialization fails', () => {
      supabaseService.getClient.mockReturnValue(undefined as any);
      expect(() => service.onModuleInit()).toThrow('Failed to initialize Supabase client');
    });
  });

  describe('subscribe', () => {
    const createSubscriptionDto: CreateSubscriptionDto = {
      memberId: '123e4567-e89b-12d3-a456-426614174000',
      sportId: '456e7890-e89b-12d3-a456-426614174000',
      subscriptionDate: new Date('2025-01-01'),
      subscriptionType: SubscriptionType.GROUP,
    };

    it('should create a subscription successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockSubscription,
        error: null,
      });

      const result = await service.subscribe(createSubscriptionDto);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscriptions');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([createSubscriptionDto]);
      expect(result).toEqual(mockSubscription);
    });

    it('should throw HttpException when database error occurs', async () => {
      const error = { message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.subscribe(createSubscriptionDto)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw HttpException when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.subscribe(createSubscriptionDto)).rejects.toThrow(
        new HttpException('No data returned from database', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe('findAll', () => {
    it('should return all subscriptions successfully', async () => {
      const mockSubscriptions = [mockSubscription];
      mockSupabaseClient.select.mockResolvedValue({
        data: mockSubscriptions,
        error: null,
      });

      const result = await service.findAll();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscriptions');
      expect(result).toEqual(mockSubscriptions);
    });

    it('should throw HttpException when database error occurs', async () => {
      const error = { message: 'Database error' };
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.findAll()).rejects.toThrow(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should throw HttpException when no subscriptions found', async () => {
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findAll()).rejects.toThrow(
        new HttpException('No subscriptions found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('findByMemberId', () => {
    const memberId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return subscriptions for a member successfully', async () => {
      memberService.findOne.mockResolvedValue(mockMember);
      const mockSubscriptions = [mockSubscription];
      mockSupabaseClient.eq.mockResolvedValue({
        data: mockSubscriptions,
        error: null,
      });

      const result = await service.findByMemberId(memberId);

      expect(memberService.findOne).toHaveBeenCalledWith(memberId);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('memberId', memberId);
      expect(result).toEqual(mockSubscriptions);
    });

    it('should throw HttpException when member does not exist', async () => {
      memberService.findOne.mockResolvedValue(undefined as any);

      await expect(service.findByMemberId(memberId)).rejects.toThrow(
        new HttpException(`Member with ID ${memberId} does not exist`, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw HttpException when database error occurs', async () => {
      memberService.findOne.mockResolvedValue(mockMember);
      const error = { message: 'Database error' };
      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.findByMemberId(memberId)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should throw HttpException when no subscriptions found for member', async () => {
      memberService.findOne.mockResolvedValue(mockMember);
      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findByMemberId(memberId)).rejects.toThrow(
        new HttpException(`No subscriptions found for member with ID ${memberId}`, HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('findBySportId', () => {
    const sportId = '456e7890-e89b-12d3-a456-426614174000';

    it('should return subscriptions for a sport successfully', async () => {
      sportService.findOne.mockResolvedValue(mockSport);
      const mockSubscriptions = [mockSubscription];
      mockSupabaseClient.eq.mockResolvedValue({
        data: mockSubscriptions,
        error: null,
      });

      const result = await service.findBySportId(sportId);

      expect(sportService.findOne).toHaveBeenCalledWith(sportId);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('sportId', sportId);
      expect(result).toEqual(mockSubscriptions);
    });

    it('should throw HttpException when sport does not exist', async () => {
      sportService.findOne.mockResolvedValue(undefined as any);

      await expect(service.findBySportId(sportId)).rejects.toThrow(
        new HttpException(`Sport with ID ${sportId} does not exist`, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw HttpException when database error occurs', async () => {
      sportService.findOne.mockResolvedValue(mockSport);
      const error = { message: 'Database error' };
      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.findBySportId(sportId)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should throw HttpException when no subscriptions found for sport', async () => {
      sportService.findOne.mockResolvedValue(mockSport);
      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findBySportId(sportId)).rejects.toThrow(
        new HttpException(`No subscriptions found for sport with ID ${sportId}`, HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('update', () => {
    const updateSubscriptionDto: UpdateSubscriptionDto = {
      memberId: '123e4567-e89b-12d3-a456-426614174000',
      sportId: '456e7890-e89b-12d3-a456-426614174000',
      subscriptionType: SubscriptionType.PRIVATE,
    };

    it('should update a subscription successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockSubscription, subscriptionType: SubscriptionType.PRIVATE },
        error: null,
      });

      const result = await service.update(updateSubscriptionDto);

      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateSubscriptionDto);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('memberId', updateSubscriptionDto.memberId);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('sportId', updateSubscriptionDto.sportId);
      expect(result.subscriptionType).toBe(SubscriptionType.PRIVATE);
    });

    it('should throw HttpException when memberId is missing', async () => {
      const invalidDto = { ...updateSubscriptionDto, memberId: undefined };

      await expect(service.update(invalidDto as UpdateSubscriptionDto)).rejects.toThrow(
        new HttpException('Member ID and Sport ID are required to update a subscription', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw HttpException when sportId is missing', async () => {
      const invalidDto = { ...updateSubscriptionDto, sportId: undefined };

      await expect(service.update(invalidDto as UpdateSubscriptionDto)).rejects.toThrow(
        new HttpException('Member ID and Sport ID are required to update a subscription', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw HttpException when subscription not found (PGRST116 error)', async () => {
      const error = { code: 'PGRST116', message: 'No rows found' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.update(updateSubscriptionDto)).rejects.toThrow(
        new HttpException('No subscription found to update', HttpStatus.NOT_FOUND)
      );
    });

    it('should throw HttpException for other database errors', async () => {
      const error = { message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.update(updateSubscriptionDto)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw HttpException when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.update(updateSubscriptionDto)).rejects.toThrow(
        new HttpException('No subscription found to update', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('unsubscribe', () => {
    const unsubscribeDto: UnsubscribeDto = {
      memberId: '123e4567-e89b-12d3-a456-426614174000',
      sportId: '456e7890-e89b-12d3-a456-426614174000',
    };

    it('should unsubscribe successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockSubscription,
        error: null,
      });

      const result = await service.unsubscribe(unsubscribeDto);

      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('memberId', unsubscribeDto.memberId);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('sportId', unsubscribeDto.sportId);
      expect(result).toBe(`User with id ${unsubscribeDto.memberId} unsubscribed from sport with id ${unsubscribeDto.sportId} successfully`);
    });

    it('should return message when subscription not found (PGRST116 error)', async () => {
      const error = { code: 'PGRST116', message: 'No rows found' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      const result = await service.unsubscribe(unsubscribeDto);

      expect(result).toBe(`Subscription for user with id ${unsubscribeDto.memberId} and sport with id ${unsubscribeDto.sportId} was not found, nothing to delete`);
    });

    it('should throw HttpException for other database errors', async () => {
      const error = { message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.unsubscribe(unsubscribeDto)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST)
      );
    });
  });
});
