// src/user/user.module.ts (user-service)

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UserService } from './user.service';

// ✅ 1. Import the Microservice Controller from its dedicated file
import { UserController } from './user.controller'; 

// ✅ 2. Import the HTTP Controller from its dedicated file
import { UserHttpController } from './user-http.controller'; 

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  
  // List both controllers
  controllers: [UserController, UserHttpController], 
  
  providers: [UserService],
})
export class UserModule {}