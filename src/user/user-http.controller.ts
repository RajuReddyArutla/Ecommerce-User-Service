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
  ParseIntPipe, // <<< IMPORT THE PARSE PIPE
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto'; 

@Controller('users') // Sets the base route to /users
export class UserHttpController {
  constructor(private readonly userService: UserService) {}

  // --- PROFILE MANAGEMENT (REST API) ---
  
  // GET /users/:userId - Get user profile details
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(
    // FIX APPLIED: Use ParseIntPipe to validate and convert the ID
    @Param('userId', ParseIntPipe) userId: number 
  ) {
    // We can now pass the validated number directly
    return this.userService.findOne(userId);
  }
  
  // PUT /users/:userId - Update user profile details
  @Put(':userId') 
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    // FIX APPLIED: Use ParseIntPipe to validate and convert the ID
    @Param('userId', ParseIntPipe) userId: number, 
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, updateProfileDto);
  }


  // --- ADDRESS MANAGEMENT (REST API) ---

  // POST /users/:userId/addresses - Add new address
  @Post(':userId/addresses')
  @HttpCode(HttpStatus.CREATED)
  async addAddress(
    // FIX APPLIED: Use ParseIntPipe
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.userService.addAddress(userId, createAddressDto);
  }

  // GET /users/:userId/addresses - Get all addresses for a user
  @Get(':userId/addresses')
  @HttpCode(HttpStatus.OK)
  async getUserAddresses(
    // FIX APPLIED: Use ParseIntPipe
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.userService.getUserAddresses(userId);
  }

  // PUT /users/:userId/addresses/:addressId - Update specific address
  @Put(':userId/addresses/:addressId')
  @HttpCode(HttpStatus.OK)
  async updateAddress(
    // FIX APPLIED: Use ParseIntPipe for both IDs
    @Param('userId', ParseIntPipe) userId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.userService.updateAddress(userId, addressId, updateAddressDto);
  }

  // DELETE /users/:userId/addresses/:addressId - Delete address
  @Delete(':userId/addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT) 
  async deleteAddress(
    // FIX APPLIED: Use ParseIntPipe for both IDs
    @Param('userId', ParseIntPipe) userId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    // Note: HttpCode(204) means you shouldn't return a body, just call the service.
    this.userService.deleteAddress(userId, addressId);
  }

  // PUT /users/:userId/addresses/:addressId/default - Set default address
  @Put(':userId/addresses/:addressId/default')
  @HttpCode(HttpStatus.OK)
  async setDefaultAddress(
    // FIX APPLIED: Use ParseIntPipe for both IDs
    @Param('userId', ParseIntPipe) userId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.userService.setDefaultAddress(userId, addressId);
  }
}