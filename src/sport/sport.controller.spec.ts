import { Test, TestingModule } from '@nestjs/testing';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { Sport } from './entities/sport.entity';
import { Gender } from './enums/gender.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('SportController', () => {
  let controller: SportController;
  let sportService: SportService;

  const mockSport: Sport = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Football',
    price: 50.00,
    allowedGender: Gender.MIX,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  const mockCreateSportDto: CreateSportDto = {
    name: 'Basketball',
    price: 30.00,
    allowedGender: Gender.MALE,
  };

  const mockUpdateSportDto: UpdateSportDto = {
    name: 'Updated Football',
    price: 60.00,
  };

  const mockSportService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportController],
      providers: [
        {
          provide: SportService,
          useValue: mockSportService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<SportController>(SportController);
    sportService = module.get<SportService>(SportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new sport', async () => {
      const expectedSport = { ...mockSport, ...mockCreateSportDto };
      mockSportService.create.mockResolvedValue(expectedSport);

      const result = await controller.create(mockCreateSportDto);

      expect(sportService.create).toHaveBeenCalledWith(mockCreateSportDto);
      expect(sportService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedSport);
    });

    it('should throw an error when sport creation fails', async () => {
      const error = new HttpException('Invalid data', HttpStatus.BAD_REQUEST);
      mockSportService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateSportDto)).rejects.toThrow(error);
      expect(sportService.create).toHaveBeenCalledWith(mockCreateSportDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of sports', async () => {
      const expectedSports = [mockSport, { ...mockSport, id: '456', name: 'Tennis' }];
      mockSportService.findAll.mockResolvedValue(expectedSports);

      const result = await controller.findAll();

      expect(sportService.findAll).toHaveBeenCalled();
      expect(sportService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedSports);
    });

    it('should return an empty array when no sports exist', async () => {
      mockSportService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(sportService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw an error when findAll fails', async () => {
      const error = new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
      mockSportService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(sportService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const sportId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return a single sport', async () => {
      mockSportService.findOne.mockResolvedValue(mockSport);

      const result = await controller.findOne(sportId);

      expect(sportService.findOne).toHaveBeenCalledWith(sportId);
      expect(sportService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSport);
    });

    it('should throw an error when sport is not found', async () => {
      const error = new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      mockSportService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(sportId)).rejects.toThrow(error);
      expect(sportService.findOne).toHaveBeenCalledWith(sportId);
    });

    it('should handle invalid sport ID format', async () => {
      const invalidId = 'invalid-id';
      const error = new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      mockSportService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(invalidId)).rejects.toThrow(error);
      expect(sportService.findOne).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('update', () => {
    const sportId = '123e4567-e89b-12d3-a456-426614174000';

    it('should update a sport', async () => {
      const updatedSport = { ...mockSport, ...mockUpdateSportDto };
      mockSportService.update.mockResolvedValue(updatedSport);

      const result = await controller.update(sportId, mockUpdateSportDto);

      expect(sportService.update).toHaveBeenCalledWith(sportId, mockUpdateSportDto);
      expect(sportService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedSport);
    });

    it('should throw an error when sport to update is not found', async () => {
      const error = new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      mockSportService.update.mockRejectedValue(error);

      await expect(controller.update(sportId, mockUpdateSportDto)).rejects.toThrow(error);
      expect(sportService.update).toHaveBeenCalledWith(sportId, mockUpdateSportDto);
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto = { price: 75.00 };
      const updatedSport = { ...mockSport, price: 75.00 };
      mockSportService.update.mockResolvedValue(updatedSport);

      const result = await controller.update(sportId, partialUpdateDto);

      expect(sportService.update).toHaveBeenCalledWith(sportId, partialUpdateDto);
      expect(result).toEqual(updatedSport);
    });

    it('should throw an error when update data is invalid', async () => {
      const error = new HttpException('Invalid data', HttpStatus.BAD_REQUEST);
      mockSportService.update.mockRejectedValue(error);

      await expect(controller.update(sportId, mockUpdateSportDto)).rejects.toThrow(error);
      expect(sportService.update).toHaveBeenCalledWith(sportId, mockUpdateSportDto);
    });
  });

  describe('remove', () => {
    const sportId = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove a sport', async () => {
      mockSportService.remove.mockResolvedValue(mockSport);

      const result = await controller.remove(sportId);

      expect(sportService.remove).toHaveBeenCalledWith(sportId);
      expect(sportService.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSport);
    });

    it('should throw an error when sport to remove is not found', async () => {
      const error = new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      mockSportService.remove.mockRejectedValue(error);

      await expect(controller.remove(sportId)).rejects.toThrow(error);
      expect(sportService.remove).toHaveBeenCalledWith(sportId);
    });

    it('should handle database errors during deletion', async () => {
      const error = new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
      mockSportService.remove.mockRejectedValue(error);

      await expect(controller.remove(sportId)).rejects.toThrow(error);
      expect(sportService.remove).toHaveBeenCalledWith(sportId);
    });
  });

  describe('Integration with SportService', () => {
    it('should properly inject SportService', () => {
      expect(sportService).toBeDefined();
      expect(sportService).toBeInstanceOf(Object);
    });

    it('should call service methods with correct parameters', async () => {
      // Test that controller passes parameters correctly to service
      await controller.create(mockCreateSportDto);
      await controller.findAll();
      await controller.findOne('test-id');
      await controller.update('test-id', mockUpdateSportDto);
      await controller.remove('test-id');

      expect(sportService.create).toHaveBeenCalledWith(mockCreateSportDto);
      expect(sportService.findAll).toHaveBeenCalledWith();
      expect(sportService.findOne).toHaveBeenCalledWith('test-id');
      expect(sportService.update).toHaveBeenCalledWith('test-id', mockUpdateSportDto);
      expect(sportService.remove).toHaveBeenCalledWith('test-id');
    });
  });
});
