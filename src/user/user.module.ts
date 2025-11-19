// // src/user/user.module.ts (user-service)

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
// import { Address } from './entities/address.entity';
// import { UserService } from './user.service';

// // ✅ 1. Import the Microservice Controller from its dedicated file
// import { UserController } from './user.controller'; 

// // ✅ 2. Import the HTTP Controller from its dedicated file
// import { UserHttpController } from './user-http.controller'; 
// import { AdminUserController } from './admin-user.controller';

// @Module({
//   imports: [TypeOrmModule.forFeature([User, Address])],
  
//   // List both controllers
//   controllers: [UserController, UserHttpController, AdminUserController], 
  
//   providers: [UserService],
// })
// export class UserModule {}


// src/user/user.module.ts (user-service)

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // ⬅️ REQUIRED
import { PassportModule } from '@nestjs/passport'; // ⬅️ REQUIRED
import { JwtModule } from '@nestjs/jwt'; // ⬅️ Recommended
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UserService } from './user.service';

// ✅ Import your controllers
import { UserController } from './user.controller'; 
import { UserHttpController } from './user-http.controller'; 
import { AdminUserController } from './admin-user.controller';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';



@Module({
  imports: [
    // 1. Add modules required for authentication and configuration
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Ensures 'jwt' is known
    JwtModule.register({}), // Registering JwtModule is often required for token handling
    
    // TypeORM
    TypeOrmModule.forFeature([User, Address]),
  ],
  
  // List both controllers
  controllers: [UserController, UserHttpController, AdminUserController], 
  
  providers: [
    UserService,
    // 2. CRUCIAL FIX: Register the strategy here so NestJS loads it
    JwtStrategy, 
  ],
  
  // Export UserService as it's likely used by other modules/microservice clients
  exports: [UserService],
})
export class UserModule {}