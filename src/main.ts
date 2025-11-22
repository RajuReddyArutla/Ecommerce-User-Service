
// src/main.ts (user-service) - FIXED VERSION
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('UserService');
  
  try {
    // ✅ 1. Create HTTP application (for REST API endpoints)
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // ✅ 2. FIXED CORS Configuration - Use array instead of "true"
    app.enableCors({
      origin: [
        'http://localhost:5173',  // Frontend port
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // ✅ 3. Add global validation pipe with enhanced options
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    // ✅ 4. REMOVED - Don't set global prefix to keep routes at root
    // app.setGlobalPrefix('api');  // ❌ This breaks your frontend calls!

    // ✅ 5. Connect microservice for TCP communication
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.TCP,
      options: {
        host: configService.get('USER_SERVICE_HOST', '127.0.0.1'),
        port: configService.get('USER_SERVICE_TCP_PORT', 3003),
      },
    });

    // ✅ 6. Start all microservices
    await app.startAllMicroservices();
    logger.log('✅ User Microservice (TCP) started on port 3003');

    // ✅ 7. Start HTTP server
    const httpPort = configService.get('USER_SERVICE_HTTP_PORT', 3002);
    await app.listen(httpPort);
    
    logger.log(`✅ User Service (HTTP) is running on port ${httpPort}`);
    logger.log('🌐 Endpoints available at: http://localhost:3002');
    logger.log('👤 Users: http://localhost:3002/users');
    logger.log('👤 Admin: http://localhost:3002/admin/users');
    logger.log('🔌 Microservice listening on: 127.0.0.1:3003');

    // ✅ 8. Graceful shutdown handling
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start User Service:', error);
    process.exit(1);
  }
}

bootstrap();