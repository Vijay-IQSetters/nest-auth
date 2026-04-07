import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  const mockedBcrypt = jest.mocked(bcrypt);

  const mockUsersService: Pick<UsersService, 'findByEmail' | 'create'> = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const mockSessionsService: Partial<SessionsService> = {};
  const mockJwtService: Partial<JwtService> = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
    mockedBcrypt.compare.mockResolvedValue(false as never);

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

  it('should login successfully', async () => {
    const loginDto = { email: 'test@test.com', password: 'test' };

    mockUsersService.findByEmail = jest.fn().mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'test',
    });

    mockSessionsService.create = jest.fn().mockResolvedValue({
      id: '1',
      userId: '1',
    });

    mockSessionsService.updateRefreshToken = jest
      .fn()
      .mockResolvedValue({ hashedRefreshToken: 'test' });

    mockedBcrypt.compare.mockResolvedValue(true as never);

    jest.spyOn(service, 'signTokens').mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const result = await service.login(loginDto);

    expect(result).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(mockSessionsService.create).toHaveBeenCalledWith('1');
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(mockSessionsService.updateRefreshToken).toHaveBeenCalled();
  });

  it('should throw an error if user is not found', async () => {
    const loginDto = { email: 'test@test.com', password: 'test' };

    mockUsersService.findByEmail = jest.fn().mockResolvedValue(null);

    await expect(service.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
