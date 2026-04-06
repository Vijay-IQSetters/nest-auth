import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService: Pick<UsersService, 'findByEmail' | 'create'> = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const mockSessionsService: Partial<SessionsService> = {};
  const mockJwtService: Partial<JwtService> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should signup successfully', async () => {
    const signupDto = { email: 'test@test.com', password: 'test' };

    mockUsersService.findByEmail = jest.fn().mockResolvedValue(null);
    mockUsersService.create = jest.fn().mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });
    const result = await service.signup(signupDto);

    expect(result).toEqual({
      id: '1',
      email: 'test@test.com',
    });

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(signupDto.email);
    expect(mockUsersService.create).toHaveBeenCalledWith(
      signupDto.email,
      expect.any(String),
    );
  });

  it('should throw an error if email is already in use', async () => {
    const signupDto = { email: 'test@test.com', password: 'test' };

    mockUsersService.findByEmail = jest.fn().mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    await expect(service.signup(signupDto)).rejects.toThrow(
      BadRequestException,
    );

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(signupDto.email);
  });
});
