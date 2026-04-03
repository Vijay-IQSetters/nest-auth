import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtValidatedUser } from '../../auth/strategies/jwt.strategy/jwt.strategy';

type RequestWithJwtUser = Request & { user: JwtValidatedUser };

export const User = createParamDecorator(
  (
    property: keyof JwtValidatedUser | undefined,
    ctx: ExecutionContext,
  ): JwtValidatedUser | string => {
    const user = ctx.switchToHttp().getRequest<RequestWithJwtUser>().user;
    if (property !== undefined) {
      return user[property];
    }
    return user;
  },
);
