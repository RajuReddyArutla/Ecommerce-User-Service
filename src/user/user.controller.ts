
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