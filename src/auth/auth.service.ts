import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/singup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import type { JwtAccessPayload } from './strategies/jwt.strategy/jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private usersService: UsersService,
    private sessionsService: SessionsService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password } = signupDto;
    const user = await this.usersService.findByEmail(email);

    if (user) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.usersService.create(email, hashedPassword);

    return {
      id: newUser.id,
      email: newUser.email,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.sessionsService.create(user.id);

    const payload = { sub: user.id, email: user.email, sid: session.id };

    const { accessToken, refreshToken } = await this.signTokens(payload);

    await this.sessionsService.updateRefreshToken(session.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signTokens(payload: { sub: string; email: string; sid: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { expiresIn: '15m' }),
      this.jwt.signAsync(payload, { expiresIn: '7d' }),
    ]);
    return { accessToken, refreshToken };
  }

  async logout(sessionId: string) {
    await this.sessionsService.delete(sessionId);
    return { message: 'Logged out successfully' };
  }

  async refresh(incomingRefreshToken: string, sessionId: string) {
    const payload =
      await this.jwt.verifyAsync<JwtAccessPayload>(incomingRefreshToken);
    if (payload.sid !== sessionId) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const session = await this.sessionsService.findById(sessionId);
    if (!session || !session.hashedRefreshToken) {
      throw new UnauthorizedException('Session expired');
    }
    const { hashedRefreshToken } = session;
    const isRefreshTokenValid = await bcrypt.compare(
      incomingRefreshToken,
      hashedRefreshToken,
    );
    if (!isRefreshTokenValid) {
      await this.sessionsService.deleteAllByUserId(payload.sub);
      throw new UnauthorizedException('Invalid session');
    }
    const user = await this.usersService.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }
    const newPayload = {
      sub: session.userId,
      email: user.email,
      sid: session.id,
    };
    const { accessToken, refreshToken } = await this.signTokens(newPayload);
    await this.sessionsService.updateRefreshToken(sessionId, refreshToken);
    return { accessToken, refreshToken };
  }
}
