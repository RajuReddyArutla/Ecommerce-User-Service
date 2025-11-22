

// src/user/admin-user.controller.ts
import { 
  Controller, 
  Get, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /admin/users/statistics
   * Get user statistics - MUST BE BEFORE /:id route
   */
  @Get('statistics')
  async getUserStatistics() {
    try {
      const stats = await this.userService.getUserStatistics();
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch user statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/users
   * Get all users with pagination
   */
  @Get()
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('role') role?: string,
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const skip = (pageNum - 1) * limitNum;

      const result = await this.userService.findAllUsers({
        skip,
        take: limitNum,
        role: role as UserRole,
      });

      return {
        success: true,
        data: result.users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(result.total / limitNum),
          totalCount: result.total,
          limit: limitNum,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch users',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/users/:id
   * Get user by ID
   */
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.userService.findOne(id);
      
      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Remove sensitive data
      const { password, refreshToken, ...userWithoutSensitiveData } = user as any;

      return {
        success: true,
        data: userWithoutSensitiveData,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch user',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PUT /admin/users/:id
   * Update user details
   */
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: {
      name?: string;
      email?: string;
      role?: UserRole;
      isActive?: boolean;
    },
  ) {
    try {
      // Validate role if provided
      if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid role provided',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedUser = await this.userService.updateUser(id, updateData);

      return {
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update user',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PUT /admin/users/:id/toggle-status
   * Toggle user active status
   */
  @Put(':id/toggle-status')
  async toggleUserStatus(@Param('id', ParseIntPipe) id: number) {
    try {
      const updatedUser = await this.userService.toggleUserStatus(id);

      return {
        success: true,
        message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to toggle user status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PUT /admin/users/:id/role
   * Update user role
   */
  @Put(':id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: UserRole,
  ) {
    try {
      if (!Object.values(UserRole).includes(role)) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid role provided',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedUser = await this.userService.updateRole(id, role);

      return {
        success: true,
        message: 'User role updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update user role',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * DELETE /admin/users/:id
   * Delete user (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.userService.deleteUser(id);

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete user',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

