// import { 
//   Controller, 
//   Get, 
//   Post, 
//   Body, 
//   Param, 
//   Put, 
//   Delete,
//   HttpStatus,
//   HttpCode,
//   ParseIntPipe, // <<< IMPORT THE PARSE PIPE
// } from '@nestjs/common';
// import { UserService } from './user.service';
// import { CreateAddressDto } from './dto/create-address.dto';
// import { UpdateAddressDto } from './dto/update-address.dto';
// import { UpdateProfileDto } from './dto/update-profile.dto'; 

// @Controller('users') // Sets the base route to /users
// export class UserHttpController {
//   constructor(private readonly userService: UserService) {}

//   // --- PROFILE MANAGEMENT (REST API) ---
  
//   // GET /users/:userId - Get user profile details
//   @Get(':userId')
//   @HttpCode(HttpStatus.OK)
//   async getUserProfile(
//     // FIX APPLIED: Use ParseIntPipe to validate and convert the ID
//     @Param('userId', ParseIntPipe) userId: number 
//   ) {
//     // We can now pass the validated number directly
//     return this.userService.findOne(userId);
//   }
  
//   // PUT /users/:userId - Update user profile details
//   @Put(':userId') 
//   @HttpCode(HttpStatus.OK)
//   async updateProfile(
//     // FIX APPLIED: Use ParseIntPipe to validate and convert the ID
//     @Param('userId', ParseIntPipe) userId: number, 
//     @Body() updateProfileDto: UpdateProfileDto,
//   ) {
//     return this.userService.updateProfile(userId, updateProfileDto);
//   }


//   // --- ADDRESS MANAGEMENT (REST API) ---

//   // POST /users/:userId/addresses - Add new address
//   @Post(':userId/addresses')
//   @HttpCode(HttpStatus.CREATED)
//   async addAddress(
//     // FIX APPLIED: Use ParseIntPipe
//     @Param('userId', ParseIntPipe) userId: number,
//     @Body() createAddressDto: CreateAddressDto,
//   ) {
//     return this.userService.addAddress(userId, createAddressDto);
//   }

//   // GET /users/:userId/addresses - Get all addresses for a user
//   @Get(':userId/addresses')
//   @HttpCode(HttpStatus.OK)
//   async getUserAddresses(
//     // FIX APPLIED: Use ParseIntPipe
//     @Param('userId', ParseIntPipe) userId: number
//   ) {
//     return this.userService.getUserAddresses(userId);
//   }

//   // PUT /users/:userId/addresses/:addressId - Update specific address
//   @Put(':userId/addresses/:addressId')
//   @HttpCode(HttpStatus.OK)
//   async updateAddress(
//     // FIX APPLIED: Use ParseIntPipe for both IDs
//     @Param('userId', ParseIntPipe) userId: number,
//     @Param('addressId', ParseIntPipe) addressId: number,
//     @Body() updateAddressDto: UpdateAddressDto,
//   ) {
//     return this.userService.updateAddress(userId, addressId, updateAddressDto);
//   }

//   // DELETE /users/:userId/addresses/:addressId - Delete address
//   @Delete(':userId/addresses/:addressId')
//   @HttpCode(HttpStatus.NO_CONTENT) 
//   async deleteAddress(
//     // FIX APPLIED: Use ParseIntPipe for both IDs
//     @Param('userId', ParseIntPipe) userId: number,
//     @Param('addressId', ParseIntPipe) addressId: number,
//   ) {
//     // Note: HttpCode(204) means you shouldn't return a body, just call the service.
//     this.userService.deleteAddress(userId, addressId);
//   }

//   // PUT /users/:userId/addresses/:addressId/default - Set default address
//   @Put(':userId/addresses/:addressId/default')
//   @HttpCode(HttpStatus.OK)
//   async setDefaultAddress(
//     // FIX APPLIED: Use ParseIntPipe for both IDs
//     @Param('userId', ParseIntPipe) userId: number,
//     @Param('addressId', ParseIntPipe) addressId: number,
//   ) {
//     return this.userService.setDefaultAddress(userId, addressId);
//   }
// }

// src/user/user-http.controller.ts (user-service) - COMPLETE UPDATED VERSION
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard) // ✅ Protect all routes with JWT authentication
export class UserHttpController {
  constructor(private readonly userService: UserService) {}

  // ==================== PROFILE MANAGEMENT ====================
  
  /**
   * GET /users/me - Get current logged-in user profile
   * ✅ New endpoint for self-profile access
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Request() req) {
    return this.userService.findOne(req.user.userId);
  }

  /**
   * GET /users/:userId - Get user profile details
   * ✅ Enhanced with authentication check
   */
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    // ✅ Users can only view their own profile (unless admin)
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return { message: 'Access denied' };
    }

    return this.userService.findOne(userId);
  }
  
  /**
   * PUT /users/:userId - Update user profile details
   * ✅ Enhanced with ownership validation
   */
  @Put(':userId') 
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req,
  ) {
    // ✅ Users can only update their own profile
    if (req.user.userId !== userId) {
      return { message: 'Access denied' };
    }

    return this.userService.updateProfile(userId, updateProfileDto);
  }

  // ==================== ADDRESS MANAGEMENT ====================

  /**
   * POST /users/:userId/addresses - Add new address
   * ✅ Enhanced with ownership validation
   */
  @Post(':userId/addresses')
  @HttpCode(HttpStatus.CREATED)
  async addAddress(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createAddressDto: CreateAddressDto,
    @Request() req,
  ) {
    // ✅ Users can only add addresses to their own account
    if (req.user.userId !== userId) {
      return { message: 'Access denied' };
    }

    return this.userService.addAddress(userId, createAddressDto);
  }

  /**
   * GET /users/:userId/addresses - Get all addresses for a user
   * ✅ Enhanced with ownership validation
   */
  @Get(':userId/addresses')
  @HttpCode(HttpStatus.OK)
  async getUserAddresses(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    // ✅ Users can only view their own addresses
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return { message: 'Access denied' };
    }

    return this.userService.getUserAddresses(userId);
  }

  /**
   * PUT /users/:userId/addresses/:addressId - Update specific address
   * ✅ Enhanced with ownership validation
   */
  @Put(':userId/addresses/:addressId')
  @HttpCode(HttpStatus.OK)
  async updateAddress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req,
  ) {
    // ✅ Users can only update their own addresses
    if (req.user.userId !== userId) {
      return { message: 'Access denied' };
    }

    return this.userService.updateAddress(userId, addressId, updateAddressDto);
  }

  /**
   * DELETE /users/:userId/addresses/:addressId - Delete address
   * ✅ Enhanced with ownership validation and proper return
   */
  @Delete(':userId/addresses/:addressId')
  @HttpCode(HttpStatus.OK) // ✅ Changed from NO_CONTENT to OK to return message
  async deleteAddress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Request() req,
  ) {
    // ✅ Users can only delete their own addresses
    if (req.user.userId !== userId) {
      return { message: 'Access denied' };
    }

    await this.userService.deleteAddress(userId, addressId);
    return { message: 'Address deleted successfully' };
  }

  /**
   * PUT /users/:userId/addresses/:addressId/default - Set default address
   * ✅ Enhanced with ownership validation
   */
  @Put(':userId/addresses/:addressId/default')
  @HttpCode(HttpStatus.OK)
  async setDefaultAddress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Request() req,
  ) {
    // ✅ Users can only set default on their own addresses
    if (req.user.userId !== userId) {
      return { message: 'Access denied' };
    }

    return this.userService.setDefaultAddress(userId, addressId);
  }
}