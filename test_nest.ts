import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const configService = app.get(ConfigService);
  const rawKey = configService.get('FIREBASE_PRIVATE_KEY');
  
  console.log('Raw key from ConfigService startsWith quote?', rawKey.startsWith('"'));
  console.log('Raw key from ConfigService endsWith quote?', rawKey.endsWith('"'));
  console.log('Raw key has literal \\n?', rawKey.includes('\\n'));
  console.log('Raw key has real newline?', rawKey.includes('\n'));
  
  process.exit(0);
}
bootstrap();
