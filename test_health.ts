import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { HealthService } from './src/health/health.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const healthService = app.get(HealthService);
  
  try {
      console.log('Testing health check...');
      const result = await healthService.check();
      console.log('Success:', result);
  } catch (e) {
      console.error('Error during health check:', e);
  }
  
  process.exit(0);
}
bootstrap();
