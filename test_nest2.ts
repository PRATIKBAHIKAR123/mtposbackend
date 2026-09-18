import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
class TestModule {}

async function bootstrap() {
  const app = await NestFactory.create(TestModule, { logger: false });
  const configService = app.get(ConfigService);
  const rawKey = configService.get('FIREBASE_PRIVATE_KEY');
  
  if (!rawKey) {
      console.log('No key found!');
      process.exit(1);
  }
  
  console.log('Raw key from ConfigService startsWith quote?', rawKey.startsWith('"'));
  console.log('Raw key from ConfigService endsWith quote?', rawKey.endsWith('"'));
  console.log('Raw key has literal \\n?', rawKey.includes('\\n'));
  console.log('Raw key has real newline?', rawKey.includes('\n'));
  
  process.exit(0);
}
bootstrap();
