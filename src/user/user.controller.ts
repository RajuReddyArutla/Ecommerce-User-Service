// // src/user/user.controller.ts (user-service)
// import { Controller } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { UserService } from './user.service';
// import { User } from './entities/user.entity';

// // Define the shape of data Auth Service will send to User Service upon registration
// interface NewUserPayload {
//     id: number;
//     email: string;
//     firstName: string;
//     lastName: string;
// }

// @Controller()
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   /**
//    * Message Pattern: user.create
//    * This endpoint is called by the Auth Service AFTER a user is successfully registered 
//    * to create the corresponding profile data in the User Service's database.
//    */
//   @MessagePattern('user.create')
//   async createProfile(@Payload() newUser: NewUserPayload): Promise<User> {
//     console.log('User Service received request to create profile:', newUser.email);
//     // Note: The ID is carried over from the Auth Service's database.
//     return this.userService.create(newUser);
//   }

//   /**
//    * Message Pattern: user.findOne
//    * Used by other services (like Orders) to get user profile details.
//    */
//   @MessagePattern('user.findOne')
//   async findOne(@Payload() userId: number): Promise<User> {
//     return this.userService.findOne(userId);
//   }
// }



// // src/user/user.controller.ts 
// import { Controller } from '@nestjs/common';
// import { MessagePattern } from '@nestjs/microservices';
// // import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-address.dto';
// import { UserService } from './user.service';
// // Assuming you have DTOs for user creation
// // import { CreateUserDto } from './dto/create-user.dto';

// @Controller() // No prefix needed for microservices
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   // 1. Handles: this.userClient.send('find_user_by_email', email)
//   @MessagePattern('find_user_by_email')
//   async findOneByEmail(email: string) {
//     // Note: The User Service must return the user object WITH the password hash if needed
//     return this.userService.findOneByEmail(email);
//   }

//   // 2. Handles: this.userClient.send('create_user', newUser)
//   @MessagePattern('create_user')
//   async create(userDto: CreateUserDto) {
//     // The DTO includes the hashed password if it's a standard registration
//     // The User Service should handle the database insertion and return the new user
//     return this.userService.create(userDto as any); 
//   }

//   // 3. Handles: this.userClient.send('find_user_with_password', loginDto.email)
//   @MessagePattern('find_user_with_password')
//   async findOneUserWithPassword(email: string) {
//     // Crucial: This must return the user object including the stored password hash
//     return this.userService.findOneUserWithPassword(email);
//   }

//   // 4. Handles: this.userClient.send('update_refresh_token', { userId, refreshToken })
//   @MessagePattern('update_refresh_token')
//   async updateRefreshToken(data: { userId: string, refreshToken: string | null }) {
//     // The User Service handles hashing/saving the refresh token to the DB
//     // No return value needed, just confirmation of success
//     return this.userService.updateRefreshToken(data.userId, data.refreshToken);
//   }
  
//   // 5. Handles: this.userClient.send('find_user_by_id_with_token', payload.sub)
//   @MessagePattern('find_user_by_id_with_token')
//   async findOneByIdWithToken(userId: string) {
//     // Crucial: This must return the user object including the stored refreshToken
//     return this.userService.findOneByIdWithToken(userId);
//   }
// }


// // src/user/user-http.controller.ts
// import { 
//   Controller, 
//   Get, 
//   Post, 
//   Body, 
//   Param, 
//   Put, 
//   Delete,
//   UseGuards,
//   Request
// } from '@nestjs/common';
// import { UserService } from './user.service';
// import { CreateAddressDto } from './dto/create-address.dto';
// import { UpdateAddressDto } from './dto/update-address.dto';

// @Controller('users') // This creates the /users route
// export class UserHttpController {
//   constructor(private readonly userService: UserService) {}

//   // GET /users/:userId - Get user profile
//   @Get(':userId')
//   async getUserProfile(@Param('userId') userId: string) {
//     return this.userService.findOne(+userId);
//   }

//   // POST /users/:userId/addresses - Add new address
//   @Post(':userId/addresses')
//   async addAddress(
//     @Param('userId') userId: string,
//     @Body() createAddressDto: CreateAddressDto,
//   ) {
//     return this.userService.addAddress(+userId, createAddressDto);
//   }

//   // GET /users/:userId/addresses - Get all addresses for a user
//   @Get(':userId/addresses')
//   async getUserAddresses(@Param('userId') userId: string) {
//     return this.userService.getUserAddresses(+userId);
//   }

//   // GET /users/:userId/addresses/:addressId - Get specific address
//   @Get(':userId/addresses/:addressId')
//   async getAddress(
//     @Param('userId') userId: string,
//     @Param('addressId') addressId: string,
//   ) {
//     return this.userService.getAddress(+userId, +addressId);
//   }

//   // PUT /users/:userId/addresses/:addressId - Update address
//   @Put(':userId/addresses/:addressId')
//   async updateAddress(
//     @Param('userId') userId: string,
//     @Param('addressId') addressId: string,
//     @Body() updateAddressDto: UpdateAddressDto,
//   ) {
//     return this.userService.updateAddress(+userId, +addressId, updateAddressDto);
//   }

//   // DELETE /users/:userId/addresses/:addressId - Delete address
//   @Delete(':userId/addresses/:addressId')
//   async deleteAddress(
//     @Param('userId') userId: string,
//     @Param('addressId') addressId: string,
//   ) {
//     return this.userService.deleteAddress(+userId, +addressId);
//   }

//   // PUT /users/:userId/addresses/:addressId/default - Set default address
//   @Put(':userId/addresses/:addressId/default')
//   async setDefaultAddress(
//     @Param('userId') userId: string,
//     @Param('addressId') addressId: string,
//   ) {
//     return this.userService.setDefaultAddress(+userId, +addressId);
//   }
// }


// src/user/user.controller.ts (Microservice TCP Controller)
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';


@Controller() // No prefix needed for microservices
export class UserController { 
  constructor(private readonly userService: UserService) {}

  // =========================================================
  // 🚀 FIX: ENDPOINT FOR ORDER SERVICE (user.findOne)
  // Handles: this.userClient.send('user.findOne', userId) from Order Service
  // This call needs user details and 'addresses' relation, handled by userService.findOne
  // =========================================================
  @MessagePattern('user.findOne')
  async findOneForOrderService(@Payload() userId: number): Promise<User> {
    // Calls the service method which finds the user by ID and includes addresses relation
    return this.userService.findOne(userId);
  }

  // =========================================================
  // AUTH SERVICE RELATED MESSAGE PATTERNS
  // =========================================================

  // 1. Handles: this.userClient.send('find_user_by_email', email)
  @MessagePattern('find_user_by_email')
  async findOneByEmail(@Payload() email: string) {
    return this.userService.findOneByEmail(email);
  }

  // 2. Handles: this.userClient.send('create_user', newUser)
  @MessagePattern('create_user')
  async create(@Payload() userDto: CreateUserDto) {
    // Note: The service handles the persistence; type assertion added for simplicity
    return this.userService.create(userDto as any); 
  }

  // 3. Handles: this.userClient.send('find_user_with_password', loginDto.email)
  @MessagePattern('find_user_with_password')
  async findOneUserWithPassword(@Payload() email: string) {
    return this.userService.findOneUserWithPassword(email);
  }

  // 4. Handles: this.userClient.send('update_refresh_token', { userId, refreshToken })
  @MessagePattern('update_refresh_token')
  async updateRefreshToken(@Payload() data: { userId: string, refreshToken: string | null }) {
    return this.userService.updateRefreshToken(data.userId, data.refreshToken);
  }
  
  // 5. Handles: this.userClient.send('find_user_by_id_with_token', payload.sub)
  @MessagePattern('find_user_by_id_with_token')
  async findOneByIdWithToken(@Payload() userId: string) {
    return this.userService.findOneByIdWithToken(userId);
  }
}