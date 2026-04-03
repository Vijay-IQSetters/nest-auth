import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('should be defined', () => {
    const prisma = { user: { findUnique: jest.fn() } };
    expect(new JwtStrategy(prisma as never)).toBeDefined();
  });
});
