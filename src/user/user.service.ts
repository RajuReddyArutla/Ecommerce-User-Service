// src/user/user.service.ts (user-service) - FIXED VERSION
import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices'; // ✅ IMPORT THIS
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  // ==================== USER CRUD OPERATIONS ====================

  /**
   * Create a new user (called by Auth Service via microservice)
   */
  async create(userData: Partial<User>): Promise<User> {
    try {
      const newUser = this.usersRepository.create(userData);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505' || error.message.includes('duplicate key')) {
        throw new RpcException({
          status: 409,
          message: 'A user with this email address already exists.'
        });
      }
      throw new RpcException({
        status: 500,
        message: 'Failed to create user'
      });
    }
  }

  /**
   * Find user by ID with addresses (Called by Order Service via microservice)
   * ✅ FIXED: Use RpcException for microservice communication
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['addresses'],
    });
    if (!user) {
      // ✅ Use RpcException instead of NotFoundException
      throw new RpcException({
        status: 404,
        message: `User with ID ${id} not found in User Service DB.`
      });
    }
    return user;
  }
  
  /**
   * Update user profile (Called by HTTP Controller PATCH /users/:id)
   * Keep NotFoundException for HTTP endpoints
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<User> {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      
      if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      Object.assign(user, updateProfileDto);
      return this.usersRepository.save(user);
  }


  // ==================== AUTH SERVICE MICROSERVICE METHODS ====================

  /**
   * Finds a user by email (for existence checks during register/google login)
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'firstName', 'lastName', 'refreshToken', 'googleId', 'role'] 
    });
  }

  /**
   * Finds a user by email with password (for login authentication)
   */
  async findOneUserWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'refreshToken', 'role']
    });
  }
  
  /**
   * Finds a user by ID with refreshToken (for token refresh)
   */
  async findOneByIdWithToken(userId: string | number): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id: userId as any },
      select: ['id', 'email', 'firstName', 'lastName', 'refreshToken', 'role']
    });
  }
  
  /**
   * Updates user's refresh token
   */
  async updateRefreshToken(userId: string | number, refreshToken: string | null): Promise<void> {
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ refreshToken: refreshToken as any })
      .where("id = :id", { id: userId })
      .execute();
  }

  // ==================== ADDRESS MANAGEMENT ====================

  /**
   * Add a new address for a user
   */
  async addAddress(userId: number, createAddressDto: CreateAddressDto): Promise<Address> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (createAddressDto.isDefault) {
      await this.addressRepository.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false }
      );
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      user,
    });

    return this.addressRepository.save(address);
  }

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: number): Promise<Address[]> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      relations: ['addresses']
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.addresses || [];
  }

  /**
   * Get a specific address
   */
  async getAddress(userId: number, addressId: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
      relations: ['user']
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found for user ${userId}`);
    }

    return address;
  }

  /**
   * Update an address
   */
  async updateAddress(
    userId: number, 
    addressId: number, 
    updateAddressDto: UpdateAddressDto
  ): Promise<Address> {
    const address = await this.getAddress(userId, addressId);

    if (updateAddressDto.isDefault) {
      await this.addressRepository.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false }
      );
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  /**
   * Delete an address
   */
  async deleteAddress(userId: number, addressId: number): Promise<void> {
    const address = await this.getAddress(userId, addressId);
    await this.addressRepository.remove(address);
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(userId: number, addressId: number): Promise<Address> {
    // Unset all defaults for this user
    await this.addressRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false }
    );

    // Set the new default
    const address = await this.getAddress(userId, addressId);
    address.isDefault = true;
    return this.addressRepository.save(address);
  }
}