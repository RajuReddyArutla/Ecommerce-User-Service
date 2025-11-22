
// src/user/user.service.ts - COMPLETE WITH ALL METHODS
import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { User, UserRole } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';

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
  async create(userData: CreateUserDto | Partial<User>): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new RpcException({
          status: 409,
          message: 'A user with this email address already exists.',
        });
      }

      const newUser = this.usersRepository.create({
        ...userData,
        role: userData.role || UserRole.CUSTOMER,
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        throw new RpcException({
          status: 409,
          message: 'A user with this email address already exists.',
        });
      }

      throw new RpcException({
        status: 500,
        message: 'Failed to create user',
      });
    }
  }

  /**
   * Find user by ID with addresses (Called by Order Service via microservice)
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['addresses'],
    });

    if (!user) {
      throw new RpcException({
        status: 404,
        message: `User with ID ${id} not found in User Service DB.`,
      });
    }

    return user;
  }

  /**
   * Get all users with pagination (HTTP endpoint)
   */
  async findAll(limit: number = 20, offset: number = 0): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isGoogleUser: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      skip: offset,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find all users with advanced filtering (for admin-user.controller.ts)
   */
  async findAllUsers(options: {
    skip?: number;
    take?: number;
    role?: UserRole;
  }): Promise<{ users: User[]; total: number }> {
    const { skip = 0, take = 20, role } = options;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.isActive',
        'user.isGoogleUser',
        'user.createdAt',
        'user.updatedAt',
      ])
      .leftJoinAndSelect('user.addresses', 'addresses');

    if (role) {
      queryBuilder.where('user.role = :role', { role });
    }

    queryBuilder.skip(skip).take(take).orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total };
  }

  /**
   * Count total users
   */
  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  /**
   * Update user (HTTP endpoint)
   */
  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if being updated
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use by another account.');
      }
    }

    // Remove password from update if present
    const { password, ...safeUpdateData } = updateData as any;

    Object.assign(user, safeUpdateData);
    const updatedUser = await this.usersRepository.save(user);

    // Return without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  /**
   * Update user with detailed validation (for admin-user.controller.ts)
   */
  async updateUser(
    id: number,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: UserRole;
      isActive?: boolean;
    },
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findOneByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictException('Email already in use by another user.');
      }
    }

    if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
      throw new BadRequestException('Invalid role provided');
    }

    Object.assign(user, updateData);
    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }

  /**
   * Delete user (HTTP endpoint)
   */
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.remove(user);
  }

  /**
   * Delete user (soft delete - for admin-user.controller.ts)
   */
  async deleteUser(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // Soft delete - just set isActive to false
    await this.usersRepository.update(id, { isActive: false });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto | any): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Check email uniqueness if being updated
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use by another account.');
      }
    }

    // Prevent role changes through profile update
    const { role, password, ...safeUpdate } = updateProfileDto as any;

    Object.assign(user, safeUpdate);
    return this.usersRepository.save(user);
  }

  // ==================== AUTH SERVICE MICROSERVICE METHODS ====================

  /**
   * Finds a user by email (for existence checks)
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'firstName', 'lastName', 'refreshToken', 'googleId', 'role', 'isGoogleUser'],
    });
  }

  /**
   * Finds a user by email with password (for login)
   */
  async findOneUserWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'refreshToken', 'role', 'isGoogleUser'],
    });
  }
  
  /**
   * Finds a user by ID with refreshToken
   */
  async findOneByIdWithToken(userId: string | number): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id: Number(userId) },
      select: ['id', 'email', 'firstName', 'lastName', 'refreshToken', 'role'],
    });
  }

  /**
   * Finds a user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { googleId },
      relations: ['addresses'],
    });
  }
  
  /**
   * Updates user's refresh token
   */
  async updateRefreshToken(userId: string | number, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(
      { id: Number(userId) },
      { refreshToken: refreshToken as any },
    );
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

    const existingAddresses = await this.addressRepository.count({
      where: { user: { id: userId } },
    });

    if (existingAddresses === 0) {
      createAddressDto.isDefault = true;
    }

    if (createAddressDto.isDefault) {
      await this.addressRepository.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false },
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
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.addressRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', id: 'ASC' },
    });
  }

  /**
   * Get a specific address
   */
  async getAddress(userId: number, addressId: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException(
        `Address with ID ${addressId} not found for user ${userId}`,
      );
    }

    return address;
  }

  /**
   * Update an address
   */
  async updateAddress(
    userId: number, 
    addressId: number, 
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.getAddress(userId, addressId);

    if (updateAddressDto.isDefault) {
      await this.addressRepository.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false },
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

    const addressCount = await this.addressRepository.count({
      where: { user: { id: userId } },
    });

    if (addressCount === 1 && address.isDefault) {
      throw new BadRequestException(
        'Cannot delete the only address. Add another address first.',
      );
    }

    await this.addressRepository.remove(address);

    if (address.isDefault && addressCount > 1) {
      const nextAddress = await this.addressRepository.findOne({
        where: { user: { id: userId } },
        order: { id: 'ASC' },
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await this.addressRepository.save(nextAddress);
      }
    }
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(userId: number, addressId: number): Promise<Address> {
    const address = await this.getAddress(userId, addressId);

    await this.addressRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );

    address.isDefault = true;
    return this.addressRepository.save(address);
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: number, role: UserRole): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    user.role = role;
    return this.usersRepository.save(user);
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStatistics(): Promise<{
    totalUsers: number;
    adminCount: number;
    customerCount: number;
    googleUsers: number;
  }> {
    const totalUsers = await this.usersRepository.count();
    const adminCount = await this.usersRepository.count({ where: { role: UserRole.ADMIN } });
    const customerCount = await this.usersRepository.count({ where: { role: UserRole.CUSTOMER } });
    const googleUsers = await this.usersRepository.count({ where: { isGoogleUser: true } });

    return {
      totalUsers,
      adminCount,
      customerCount,
      googleUsers,
    };
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    user.isActive = !user.isActive;
    return this.usersRepository.save(user);
  }
}


