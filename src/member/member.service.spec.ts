import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MemberService } from './member.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Gender } from './enums/gender.enum';

describe('MemberService', () => {
  let service: MemberService;
  let supabaseService: SupabaseService;
  let mockSupabaseClient: any;

  const mockMember = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    gender: Gender.MALE,
    dob: '1990-01-01',
    associatedMemberId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMemberDto: CreateMemberDto = {
    firstName: 'John',
    lastName: 'Doe',
    gender: Gender.MALE,
    dob: '1990-01-01',
    associatedMemberId: undefined,
  };

  const updateMemberDto: UpdateMemberDto = {
    firstName: 'Jane',
    lastName: 'Smith',
  };

  beforeEach(async () => {
    // Create mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    // Create mock SupabaseService
    const mockSupabaseService = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    // Initialize the service (calls onModuleInit)
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize Supabase client successfully', () => {
      expect(supabaseService.getClient).toHaveBeenCalled();
    });

    it('should throw error if Supabase client is not available', () => {
      jest.spyOn(supabaseService, 'getClient').mockReturnValue(undefined as any);
      expect(() => service.onModuleInit()).toThrow('Failed to initialize Supabase client');
    });
  });

  describe('create', () => {
    it('should create a member successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockMember,
        error: null,
      });

      const result = await service.create(createMemberDto);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('members');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([createMemberDto]);
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(result).toEqual(mockMember);
    });

    it('should throw HttpException when Supabase returns an error', async () => {
      const error = { message: 'Validation error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.create(createMemberDto)).rejects.toThrow(
        new HttpException('Validation error', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.create(createMemberDto)).rejects.toThrow(
        new HttpException('No data returned from database', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('findOne', () => {
    const memberId = '123e4567-e89b-12d3-a456-426614174000';

    it('should find a member by id successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockMember,
        error: null,
      });

      const result = await service.findOne(memberId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('members');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', memberId);
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(result).toEqual(mockMember);
    });

    it('should throw NOT_FOUND when member does not exist (PGRST116 error)', async () => {
      const error = { code: 'PGRST116', message: 'No rows found' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.findOne(memberId)).rejects.toThrow(
        new HttpException('Member not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw NOT_FOUND for other Supabase errors', async () => {
      const error = { message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.findOne(memberId)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw NOT_FOUND when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findOne(memberId)).rejects.toThrow(
        new HttpException('Member not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    const memberId = '123e4567-e89b-12d3-a456-426614174000';
    const updatedMember = { ...mockMember, ...updateMemberDto };

    it('should update a member successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: updatedMember,
        error: null,
      });

      const result = await service.update(memberId, updateMemberDto);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('members');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateMemberDto);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', memberId);
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(result).toEqual(updatedMember);
    });

    it('should throw NOT_FOUND when member does not exist (PGRST116 error)', async () => {
      const error = { code: 'PGRST116', message: 'No rows found' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.update(memberId, updateMemberDto)).rejects.toThrow(
        new HttpException('Member not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw BAD_REQUEST for other Supabase errors', async () => {
      const error = { message: 'Validation error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.update(memberId, updateMemberDto)).rejects.toThrow(
        new HttpException('Validation error', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw NOT_FOUND when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.update(memberId, updateMemberDto)).rejects.toThrow(
        new HttpException('Member not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('remove', () => {
    const memberId = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove a member successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockMember,
        error: null,
      });

      const result = await service.remove(memberId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('members');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', memberId);
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(result).toEqual(mockMember);
    });

    it('should throw NOT_FOUND when member does not exist (PGRST116 error)', async () => {
      const error = { code: 'PGRST116', message: 'No rows found' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.remove(memberId)).rejects.toThrow(
        new HttpException('Member not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw BAD_REQUEST for other Supabase errors', async () => {
      const error = { message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.remove(memberId)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw NOT_FOUND when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.remove(memberId)).rejects.toThrow(
        new HttpException('Member not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findAll', () => {
    const mockMembers = [mockMember, { ...mockMember, id: 'another-id' }];

    it('should find all members successfully', async () => {
      mockSupabaseClient.select.mockResolvedValue({
        data: mockMembers,
        error: null,
      });

      const result = await service.findAll();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('members');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(result).toEqual(mockMembers);
    });

    it('should throw BAD_REQUEST when Supabase returns an error', async () => {
      const error = { message: 'Database error' };
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error,
      });

      await expect(service.findAll()).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw INTERNAL_SERVER_ERROR when no data is returned', async () => {
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findAll()).rejects.toThrow(
        new HttpException('No data returned from database', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should return empty array when no members exist', async () => {
      mockSupabaseClient.select.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });
});
