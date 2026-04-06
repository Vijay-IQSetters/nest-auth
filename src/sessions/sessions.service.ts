import { Injectable } from '@nestjs/common';
// import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// type SessionWithUserEmail = Prisma.SessionGetPayload<{
//   include: { user: { select: { email: true } } };
// }>;

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string) {
    return this.prisma.session.create({
      data: { userId },
    });
  }

  async findAllByUserId(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      // include: { user: { select: { email: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
      // include: { user: { select: { email: true } } },
    });
  }

  async updateRefreshToken(id: string, token: string) {
    return this.prisma.session.update({
      where: { id },
      data: { hashedRefreshToken: await bcrypt.hash(token, 10) },
    });
  }

  async delete(id: string) {
    return this.prisma.session.delete({ where: { id } });
  }

  async deleteAllByUserId(userId: string) {
    return this.prisma.session.deleteMany({ where: { userId } });
  }
}
