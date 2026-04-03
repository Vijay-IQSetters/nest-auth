import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// import { existsSync, readFileSync } from 'node:fs';
// import { resolve } from 'node:path';

// function loadDotenvFromFile(): void {
//   const envPath = resolve(process.cwd(), '.env');

//   if (!existsSync(envPath)) {
//     return;
//   }

//   const content = readFileSync(envPath, 'utf8');
//   for (const line of content.split(/\r?\n/)) {
//     const trimmed = line.trim();
//     if (!trimmed || trimmed.startsWith('#')) {
//       continue;
//     }

//     const separatorIndex = trimmed.indexOf('=');
//     if (separatorIndex === -1) {
//       continue;
//     }

//     const key = trimmed.slice(0, separatorIndex).trim();
//     let value = trimmed.slice(separatorIndex + 1).trim();

//     if (value.startsWith('"') && value.endsWith('"')) {
//       value = value.slice(1, -1);
//     }
//     if (value.startsWith("'") && value.endsWith("'")) {
//       value = value.slice(1, -1);
//     }

//     if (!(key in process.env)) {
//       process.env[key] = value;
//     }
//   }
// }

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DIRECT_URL');
    if (!connectionString) {
      throw new Error('DIRECT_URL environment variable is not set');
    }
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
