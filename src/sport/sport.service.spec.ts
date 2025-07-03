import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SportService } from './sport.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { Gender } from './enums/gender.enum';
import { Sport } from './entities/sport.entity';

describe('SportService', () => {
  let service: SportService;
  let supabaseService: SupabaseService;
  let cacheManager: any;
  let mockSupabaseClient: any;

  const mockSport: Sport = {
    id: 'test-uuid',
    name: 'Football',
    price: 100.0,
    allowedGender: Gender.MIX,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateSportDto: CreateSportDto = {
    name: 'Football',
    price: 100.0,
    allowedGender: Gender.MIX,
  };

  const mockUpdateSportDto: UpdateSportDto = {
    name: 'Updated Football',
    price: 150.0,
  };

  beforeEach(async () => {
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    const mockSupabaseService = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<SportService>(SportService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    cacheManager = module.get(CACHE_MANAGER);

    // Initialize the service
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize supabase client', () => {
      expect(supabaseService.getClient).toHaveBeenCalled();
    });

    it('should throw error if supabase client is not initialized', () => {
      const mockSupabaseServiceFail = {
        getClient: jest.fn().mockReturnValue(null),
      };

      const testService = new SportService(
        mockSupabaseServiceFail as any,
        cacheManager,
      );

      expect(() => testService.onModuleInit()).toThrow(
        'Failed to initialize Supabase client',
      );
    });
  });

  describe('create', () => {
    it('should create a sport successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockSport,
        error: null,
      });

      const result = await service.create(mockCreateSportDto);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sports');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([
        mockCreateSportDto,
      ]);
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith('sports:all');
      expect(result).toEqual(mockSport);
    });

    it('should throw HttpException when supabase returns error', async () => {
      const mockError = { message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(service.create(mockCreateSportDto)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.create(mockCreateSportDto)).rejects.toThrow(
        new HttpException(
          'No data returned from database',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return cached sports if available', async () => {
      const cachedSports = [mockSport];
      cacheManager.get.mockResolvedValue(cachedSports);

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('sports:all');
      expect(result).toEqual(cachedSports);
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should fetch sports from database when cache is empty', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockSupabaseClient.select.mockResolvedValue({
        data: [mockSport],
        error: null,
      });

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('sports:all');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sports');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        'sports:all',
        [mockSport],
        300000,
      );
      expect(result).toEqual([mockSport]);
    });

    it('should throw HttpException when supabase returns error', async () => {
      cacheManager.get.mockResolvedValue(null);
      const mockError = { message: 'Database error' };
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(service.findAll()).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException when no data is returned', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findAll()).rejects.toThrow(
        new HttpException(
          'No data returned from database',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('findOne', () => {
    it('should find a sport by id successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockSport,
        error: null,
      });

      const result = await service.findOne('test-uuid');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sports');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'test-uuid');
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(result).toEqual(mockSport);
    });

    it('should throw HttpException when sport is not found (PGRST116)', async () => {
      const mockError = { code: 'PGRST116', message: 'No rows found' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new HttpException('Sport not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException when other supabase error occurs', async () => {
      const mockError = { code: 'OTHER_ERROR', message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(service.findOne('test-uuid')).rejects.toThrow(
        new HttpException('Database error', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findOne('test-uuid')).rejects.toThrow(
        new HttpException('Sport not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update a sport successfully', async () => {
      const updatedSport = { ...mockSport, ...mockUpdateSportDto };
      mockSupabaseClient.single.mockResolvedValue({
        data: updatedSport,
        error: null,
      });

      const result = await service.update('test-uuid', mockUpdateSportDto);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sports');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        mockUpdateSportDto,
      );
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'test-uuid');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith('sports:all');
      expect(result).toEqual(updatedSport);
    });

    it('should throw HttpException when sport is not found (PGRST116)', async () => {
      const mockError = { code: 'PGRST116', message: 'No rows found' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(
        service.update('non-existent-id', mockUpdateSportDto),
      ).rejects.toThrow(
        new HttpException('Sport not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException when other supabase error occurs', async () => {
      const mockError = { code: 'OTHER_ERROR', message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(
        service.update('test-uuid', mockUpdateSportDto),
      ).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException when no data is returned', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        service.update('test-uuid', mockUpdateSportDto),
      ).rejects.toThrow(
        new HttpException('Sport not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('remove', () => {
    it('should remove a sport successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockSport,
        error: null,
      });

      const result = await service.remove('test-uuid');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sports');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'test-uuid');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith('sports:all');
      expect(result).toEqual(mockSport);
    });

    it('should throw HttpException when sport is not found (PGRST116)', async () => {
      const mockError = { code: 'PGRST116', message: 'No rows found' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        new HttpException('Sport not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException when other supabase error occurs', async () => {
      const mockError = { code: 'OTHER_ERROR', message: 'Database error' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(service.remove('test-uuid')).rejects.toThrow(
        new HttpException('Database error', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
