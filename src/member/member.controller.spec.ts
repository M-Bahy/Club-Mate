import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';
import { Gender } from './enums/gender.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MemberController', () => {
  let controller: MemberController;
  let service: MemberService;

  // Mock data
  const mockMember: Member = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    gender: Gender.MALE,
    dob: new Date('1990-01-01'),
    associatedMemberId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateMemberDto: CreateMemberDto = {
    firstName: 'John',
    lastName: 'Doe',
    gender: Gender.MALE,
    dob: '1990-01-01',
  };

  const mockUpdateMemberDto: UpdateMemberDto = {
    firstName: 'Jane',
    lastName: 'Smith',
  };

  // Mock service
  const mockMemberService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: mockMemberService,
        },
      ],
    }).compile();

    controller = module.get<MemberController>(MemberController);
    service = module.get<MemberService>(MemberService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a member successfully', async () => {
      // Arrange
      mockMemberService.create.mockResolvedValue(mockMember);

      // Act
      const result = await controller.create(mockCreateMemberDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateMemberDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMember);
    });

    it('should throw an error when service fails', async () => {
      // Arrange
      const error = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      mockMemberService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(mockCreateMemberDto)).rejects.toThrow(
        error,
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateMemberDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of members', async () => {
      // Arrange
      const mockMembers = [mockMember];
      mockMemberService.findAll.mockResolvedValue(mockMembers);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMembers);
    });

    it('should return empty array when no members found', async () => {
      // Arrange
      mockMemberService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const memberId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return a member by id', async () => {
      // Arrange
      mockMemberService.findOne.mockResolvedValue(mockMember);

      // Act
      const result = await controller.findOne(memberId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(memberId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMember);
    });

    it('should throw an error when member not found', async () => {
      // Arrange
      const error = new HttpException('Member not found', HttpStatus.NOT_FOUND);
      mockMemberService.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOne(memberId)).rejects.toThrow(error);
      expect(service.findOne).toHaveBeenCalledWith(memberId);
    });
  });

  describe('update', () => {
    const memberId = '123e4567-e89b-12d3-a456-426614174000';

    it('should update a member successfully', async () => {
      // Arrange
      const updatedMember = { ...mockMember, ...mockUpdateMemberDto };
      mockMemberService.update.mockResolvedValue(updatedMember);

      // Act
      const result = await controller.update(memberId, mockUpdateMemberDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(
        memberId,
        mockUpdateMemberDto,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedMember);
    });

    it('should throw an error when member not found for update', async () => {
      // Arrange
      const error = new HttpException('Member not found', HttpStatus.NOT_FOUND);
      mockMemberService.update.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.update(memberId, mockUpdateMemberDto),
      ).rejects.toThrow(error);
      expect(service.update).toHaveBeenCalledWith(
        memberId,
        mockUpdateMemberDto,
      );
    });
  });

  describe('remove', () => {
    const memberId = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove a member successfully', async () => {
      // Arrange
      mockMemberService.remove.mockResolvedValue(mockMember);

      // Act
      const result = await controller.remove(memberId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(memberId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMember);
    });

    it('should throw an error when member not found for removal', async () => {
      // Arrange
      const error = new HttpException('Member not found', HttpStatus.NOT_FOUND);
      mockMemberService.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(memberId)).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith(memberId);
    });
  });
});
