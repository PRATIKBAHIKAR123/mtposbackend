import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter.js';

describe('App & Security (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/v1/health (GET) should return 200 and ok status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
    });
  });

  describe('Unauthenticated Security Bounds', () => {
    it('should reject unauthenticated access to /api/v1/system-admin/dashboard with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/system-admin/dashboard')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/system-admin/applications with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/system-admin/applications')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/system-admin/businesses with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/system-admin/businesses')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/system-admin/plans with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/system-admin/plans')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/system-admin/subscriptions with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/system-admin/subscriptions')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/applications/:id with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/applications/some-test-id')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/tenants/:id with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/tenants/some-test-id')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/categories with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/menu with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/menu')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/tables with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/tables')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/customers with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/tax-rates with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/tax-rates')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/discounts with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/discounts')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/orders with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/orders')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/payments with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments')
        .expect(401);
    });

    it('should reject unauthenticated access to /api/v1/printers with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/printers')
        .expect(401);
    });
  });
});
