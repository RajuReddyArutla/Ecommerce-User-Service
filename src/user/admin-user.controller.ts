// src/user/admin-user.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  ParseEnumPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard'; // ✅ CORRECT IMPORT
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Apply both guards
@Roles(UserRole.ADMIN) // ✅ Only admins can access
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /admin/users - Get all users with pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    // ✅ Convert string to number if needed
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    return this.userService.findAll(pageNum, limitNum);
  }

  /**
   * GET /admin/users/statistics - Get user statistics
   */
  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getUserStatistics() {
    return this.userService.getUserStatistics();
  }

  /**
   * GET /admin/users/:userId - Get specific user details
   */
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.findOne(userId);
  }

  /**
   * PUT /admin/users/:userId/role - Update user role
   */
  @Put(':userId/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('role', new ParseEnumPipe(UserRole)) role: UserRole,
  ) {
    return this.userService.updateRole(userId, role);
  }

  /**
   * DELETE /admin/users/:userId - Delete a user
   */
  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    await this.userService.remove(userId);
    return { message: 'User deleted successfully' };
  }
}