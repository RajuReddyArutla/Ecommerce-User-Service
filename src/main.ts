// src/main.ts (User Service)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    console.log('🚀 Starting User Service bootstrap...');
    
    const app = await NestFactory.create(AppModule);
    console.log('✅ NestFactory.create completed');
    
    const configService = app.get(ConfigService);
    
    const tcpHost = configService.get<string>('TCP_HOST') || '127.0.0.1';
    const tcpPort = configService.get<number>('TCP_PORT') || 3002;
    
    console.log(`📡 Configuring TCP microservice on ${tcpHost}:${tcpPort}`);
    
    app.connectMicroservice({
      transport: Transport.TCP,
      options: {
        host: tcpHost,
        port: tcpPort,
      },
    });

    console.log('🎧 Starting all microservices...');
    await app.startAllMicroservices();
    console.log('✅ Microservices started');
    
    const httpPort = configService.get<number>('PORT') || 3002;
    console.log(`🌐 Starting HTTP server on port ${httpPort}...`);
    await app.listen(httpPort);

    console.log(`✅ User Service (HTTP) running on port ${httpPort}`);
    console.log(`✅ User Service (TCP) running on port ${tcpPort}`);
  } catch (error) {
    console.error('❌ Failed to start User Service:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

bootstrap();
