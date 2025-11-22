
// src/user/user.module.ts (user-service)

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UserService } from './user.service';

// ✅ Import all three controllers
import { UserController } from './user.controller'; 
import { UserHttpController } from './user-http.controller'; 
import { AdminUserController } from './admin-user.controller';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { UserCustomerController } from './user-customer.controller';

@Module({
  imports: [
    // Required for authentication and configuration
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    
    // TypeORM
    TypeOrmModule.forFeature([User, Address]),
  ],
  
  // ✅ Register all three controllers
  controllers: [
    UserController,        // Microservice TCP controller
    UserHttpController,    // HTTP REST controller for user operations
    AdminUserController,   // HTTP REST controller for admin operations
     UserCustomerController,
  ], 
  
  providers: [
    UserService,
    JwtStrategy, // JWT Strategy for authentication
  ],
  
  exports: [UserService],
})
export class UserModule {}