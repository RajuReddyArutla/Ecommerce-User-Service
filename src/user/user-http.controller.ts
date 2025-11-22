
// src/user/user-http.controller.ts
import { Controller, Get, Put, Delete, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

// Add this HTTP controller alongside your TCP controller
@Controller('admin/users') // HTTP REST endpoint
export class UserHttpController {
  constructor(private readonly userService: UserService) {}

  // GET /admin/users - Get all users with pagination
  @Get()
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      this.userService.findAll(limitNum, offset),
      this.userService.count(),
    ]);

    return {
      data: users,
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  // GET /admin/users/:id - Get user by ID
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findOne(parseInt(id));
  }

  // PUT /admin/users/:id - Update user
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.userService.update(parseInt(id), updateData);
  }

  // DELETE /admin/users/:id - Delete user
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.remove(parseInt(id));
    return { message: 'User deleted successfully' };
  }

  // POST /admin/users - Create user
  @Post()
  async createUser(@Body() userData: any) {
    return this.userService.create(userData);
  }
}