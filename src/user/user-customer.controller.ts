// src/user/user-customer.controller.ts - Customer endpoints
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('users')
export class UserCustomerController {
  constructor(private readonly userService: UserService) {}

  // GET /users/:userId - Get user profile
  @Get(':userId')
  async getUserProfile(@Param('userId') userId: string) {
    return this.userService.findOne(parseInt(userId));
  }

  // GET /users/:userId/addresses - Get user addresses
  @Get(':userId/addresses')
  async getUserAddresses(@Param('userId') userId: string) {
    return this.userService.getUserAddresses(parseInt(userId));
  }

  // POST /users/:userId/addresses - Add address
  @Post(':userId/addresses')
  async addAddress(
    @Param('userId') userId: string,
    @Body() addressDto: CreateAddressDto,
  ) {
    return this.userService.addAddress(parseInt(userId), addressDto);
  }

  // PUT /users/:userId/addresses/:addressId - Update address
  @Put(':userId/addresses/:addressId')
  async updateAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() addressDto: UpdateAddressDto,
  ) {
    return this.userService.updateAddress(
      parseInt(userId),
      parseInt(addressId),
      addressDto,
    );
  }

  // DELETE /users/:userId/addresses/:addressId - Delete address
  @Delete(':userId/addresses/:addressId')
  async deleteAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.userService.deleteAddress(parseInt(userId), parseInt(addressId));
  }
}