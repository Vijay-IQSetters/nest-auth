import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import type {
  JwtFromRequestFunction,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import type { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

/** Same behavior as `ExtractJwt.fromAuthHeaderAsBearerToken` without the `ExtractJwt` namespace (avoids flaky resolution under `nodenext`). */
const jwtFromBearerHeader: JwtFromRequestFunction<Request> = (req: Request) => {
  const header = req.headers.authorization;
  if (typeof header !== 'string') {
    return null;
  }
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
};

/** Shape of JWT claims issued in `AuthService.signTokens`. */
export interface JwtAccessPayload {
  sub: string;
  email: string;
  sid: string;
}

/** Set on Express `req.user` after `JwtStrategy.validate`. */
export type JwtValidatedUser = {
  id: string;
  email: string;
  role: Role;
  sid: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: jwtFromBearerHeader,
      secretOrKey: 'super-secret', // later env
    } satisfies StrategyOptionsWithoutRequest);
  }

  async validate(payload: JwtAccessPayload): Promise<JwtValidatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      select: { id: true },
    });
    if (!session) {
      throw new UnauthorizedException();
    }

    return { ...user, sid: session.id };
  }
}
