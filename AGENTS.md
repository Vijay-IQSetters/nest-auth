## Learned User Preferences

## Learned Workspace Facts

- Prisma 7 in this project: instantiate `PrismaClient` with a PostgreSQL driver adapter (e.g. `PrismaPg` with `connectionString` from config/env); do not pass `datasourceUrl` into the `PrismaClient` constructor.
- NestJS JWT: `JwtModule.register(...)` already provides a configured `JwtService`; avoid listing `JwtService` again in module `providers`, or a second unconfigured instance can be injected and signing fails with `secretOrPrivateKey must have a value`.
- NestJS + Passport: `AuthGuard('jwt')` needs `PassportModule` imported and `JwtStrategy` registered in `providers`, otherwise Passport reports an unknown authentication strategy `"jwt"`.
