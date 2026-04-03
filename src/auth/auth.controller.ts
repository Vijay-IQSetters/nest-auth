import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/singup.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { User } from './decorators/user.decorator';
import type { JwtValidatedUser } from './strategies/jwt.strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@User() user: JwtValidatedUser) {
    return user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@User('sid') sid: string) {
    return this.authService.logout(sid);
  }

  @Post('refresh')
  // @UseGuards(JwtAuthGuard)
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(
      refreshTokenDto.refreshToken,
      refreshTokenDto.sessionId,
    );
  }
}
