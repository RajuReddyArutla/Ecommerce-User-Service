// // src/user/user.service.ts (user-service) - FIXED VERSION
// import { 
//   Injectable, 
//   NotFoundException, 
//   ConflictException,
//   BadRequestException
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { RpcException } from '@nestjs/microservices'; // ✅ IMPORT THIS
// import { User } from './entities/user.entity';
// import { Address } from './entities/address.entity';
// import { CreateAddressDto } from './dto/create-address.dto';
// import { UpdateAddressDto } from './dto/update-address.dto';
// import { UpdateProfileDto } from './dto/update-profile.dto';

// @Injectable()
// export class UserService {
//   constructor(
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//     @InjectRepository(Address)
//     private addressRepository: Repository<Address>,
//   ) {}

//   // ==================== USER CRUD OPERATIONS ====================

//   /**
//    * Create a new user (called by Auth Service via microservice)
//    */
//   async create(userData: Partial<User>): Promise<User> {
//     try {
//       const newUser = this.usersRepository.create(userData);
//       return await this.usersRepository.save(newUser);
//     } catch (error) {
//       if (error.code === '23505' || error.message.includes('duplicate key')) {
//         throw new RpcException({
//           status: 409,
//           message: 'A user with this email address already exists.'
//         });
//       }
//       throw new RpcException({
//         status: 500,
//         message: 'Failed to create user'
//       });
//     }
//   }

//   /**
//    * Find user by ID with addresses (Called by Order Service via microservice)
//    * ✅ FIXED: Use RpcException for microservice communication
//    */
//   async findOne(id: number): Promise<User> {
//     const user = await this.usersRepository.findOne({ 
//       where: { id },
//       relations: ['addresses'],
//     });
//     if (!user) {
//       // ✅ Use RpcException instead of NotFoundException
//       throw new RpcException({
//         status: 404,
//         message: `User with ID ${id} not found in User Service DB.`
//       });
//     }
//     return user;
//   }
  
//   /**
//    * Update user profile (Called by HTTP Controller PATCH /users/:id)
//    * Keep NotFoundException for HTTP endpoints
//    */
//   async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<User> {
//       const user = await this.usersRepository.findOne({ where: { id: userId } });
      
//       if (!user) {
//           throw new NotFoundException(`User with ID ${userId} not found.`);
//       }

//       Object.assign(user, updateProfileDto);
//       return this.usersRepository.save(user);
//   }


//   // ==================== AUTH SERVICE MICROSERVICE METHODS ====================

//   /**
//    * Finds a user by email (for existence checks during register/google login)
//    */
//   async findOneByEmail(email: string): Promise<User | null> {
//     return this.usersRepository.findOne({ 
//       where: { email },
//       select: ['id', 'email', 'firstName', 'lastName', 'refreshToken', 'googleId', 'role'] 
//     });
//   }

//   /**
//    * Finds a user by email with password (for login authentication)
//    */
//   async findOneUserWithPassword(email: string): Promise<User | null> {
//     return this.usersRepository.findOne({ 
//       where: { email },
//       select: ['id', 'email', 'password', 'firstName', 'lastName', 'refreshToken', 'role']
//     });
//   }
  
//   /**
//    * Finds a user by ID with refreshToken (for token refresh)
//    */
//   async findOneByIdWithToken(userId: string | number): Promise<User | null> {
//     return this.usersRepository.findOne({ 
//       where: { id: userId as any },
//       select: ['id', 'email', 'firstName', 'lastName', 'refreshToken', 'role']
//     });
//   }
  
//   /**
//    * Updates user's refresh token
//    */
//   async updateRefreshToken(userId: string | number, refreshToken: string | null): Promise<void> {
//     await this.usersRepository
//       .createQueryBuilder()
//       .update(User)
//       .set({ refreshToken: refreshToken as any })
//       .where("id = :id", { id: userId })
//       .execute();
//   }

//   // ==================== ADDRESS MANAGEMENT ====================

//   /**
//    * Add a new address for a user
//    */
//   async addAddress(userId: number, createAddressDto: CreateAddressDto): Promise<Address> {
//     const user = await this.usersRepository.findOne({ where: { id: userId } });
    
//     if (!user) {
//       throw new NotFoundException(`User with ID ${userId} not found`);
//     }

//     if (createAddressDto.isDefault) {
//       await this.addressRepository.update(
//         { user: { id: userId }, isDefault: true },
//         { isDefault: false }
//       );
//     }

//     const address = this.addressRepository.create({
//       ...createAddressDto,
//       user,
//     });

//     return this.addressRepository.save(address);
//   }

//   /**
//    * Get all addresses for a user
//    */
//   async getUserAddresses(userId: number): Promise<Address[]> {
//     const user = await this.usersRepository.findOne({ 
//       where: { id: userId },
//       relations: ['addresses']
//     });
    
//     if (!user) {
//       throw new NotFoundException(`User with ID ${userId} not found`);
//     }

//     return user.addresses || [];
//   }

//   /**
//    * Get a specific address
//    */
//   async getAddress(userId: number, addressId: number): Promise<Address> {
//     const address = await this.addressRepository.findOne({
//       where: { id: addressId, user: { id: userId } },
//       relations: ['user']
//     });

//     if (!address) {
//       throw new NotFoundException(`Address with ID ${addressId} not found for user ${userId}`);
//     }

//     return address;
//   }

//   /**
//    * Update an address
//    */
//   async updateAddress(
//     userId: number, 
//     addressId: number, 
//     updateAddressDto: UpdateAddressDto
//   ): Promise<Address> {
//     const address = await this.getAddress(userId, addressId);

//     if (updateAddressDto.isDefault) {
//       await this.addressRepository.update(
//         { user: { id: userId }, isDefault: true },
//         { isDefault: false }
//       );
//     }

//     Object.assign(address, updateAddressDto);
//     return this.addressRepository.save(address);
//   }

//   /**
//    * Delete an address
//    */
//   async deleteAddress(userId: number, addressId: number): Promise<void> {
//     const address = await this.getAddress(userId, addressId);
//     await this.addressRepository.remove(address);
//   }

//   /**
//    * Set an address as default
//    */
//   async setDefaultAddress(userId: number, addressId: number): Promise<Address> {
//     // Unset all defaults for this user
//     await this.addressRepository.update(
//       { user: { id: userId }, isDefault: true },
//       { isDefault: false }
//     );

//     // Set the new default
//     const address = await this.getAddress(userId, addressId);
//     address.isDefault = true;
//     return this.addressRepository.save(address);
//   }
// }



// src/user/user.service.ts (user-service) - COMPLETE UPDATED VERSION
import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
  ForbiddenException,
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
   * ✅ Enhanced with better error handling and role support
   */
  async create(userData: CreateUserDto | Partial<User>): Promise<User> {
    try {
      // ✅ Check if email already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new RpcException({
          status: 409,
          message: 'A user with this email address already exists.',
        });
      }

      // ✅ Create user with default role if not provided
      const newUser = this.usersRepository.create({
        ...userData,
        role: userData.role || UserRole.CUSTOMER,
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      // ✅ Handle database constraint errors
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
   * ✅ Uses RpcException for microservice communication
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
   * Update user profile (Called by HTTP Controller PUT /users/:id)
   * ✅ Enhanced with email uniqueness check and role protection
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // ✅ Check email uniqueness if being updated
    // 💡 Note: updateProfileDto is assumed to have an 'email' property.
    // Error TS2339 is fixed by ensuring UpdateProfileDto has 'email' or 
    // by using an assertion like: updateProfileDto as Partial<User>
    // Assuming UpdateProfileDto is correctly defined to contain 'email':
    if (
      'email' in updateProfileDto && // Check if property exists
      updateProfileDto.email && 
      updateProfileDto.email !== user.email
    ) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateProfileDto.email as string },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use by another account.');
      }
    }

    // ✅ Prevent role changes through profile update (use dedicated admin endpoint)
    if ('role' in updateProfileDto) {
      delete updateProfileDto.role;
    }

    Object.assign(user, updateProfileDto);
    return this.usersRepository.save(user);
  }

  /**
   * Delete user (soft delete recommended in production)
   * ✅ New method for user deletion
   */
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // ✅ Remove user (cascade will handle addresses)
    await this.usersRepository.remove(user);
  }

  // ==================== AUTH SERVICE MICROSERVICE METHODS ====================

  /**
   * Finds a user by email (for existence checks during register/google login)
   * ✅ Enhanced with role selection
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'firstName', 'lastName', 'refreshToken', 'googleId', 'role', 'isGoogleUser'],
    });
  }

  /**
   * Finds a user by email with password (for login authentication)
   * ✅ Enhanced with role selection
   */
  async findOneUserWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'refreshToken', 'role', 'isGoogleUser'],
    });
  }
  
  /**
   * Finds a user by ID with refreshToken (for token refresh)
   * ✅ Enhanced with role selection
   */
  async findOneByIdWithToken(userId: string | number): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id: Number(userId) },
      select: ['id', 'email', 'firstName', 'lastName', 'refreshToken', 'role'],
    });
  }

  /**
   * Finds a user by Google ID
   * ✅ New method for Google OAuth
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { googleId },
      relations: ['addresses'],
    });
  }
  
  /**
   * Updates user's refresh token
   * ✅ Enhanced with type safety
   */
  async updateRefreshToken(userId: string | number, refreshToken: string | null): Promise<void> {
    // ✅ FIX: Use 'as any' to allow null for refreshToken in TypeORM's update
    // This is a common workaround when entity properties are defined as 'string'
    // but need to be updated to 'null' (e.g., to invalidate the token).
    await this.usersRepository.update(
      { id: Number(userId) },
      { refreshToken: refreshToken as any },
    );
  }

  // ==================== ADDRESS MANAGEMENT ====================

  /**
   * Add a new address for a user
   * ✅ Enhanced with default address handling
   */
  async addAddress(userId: number, createAddressDto: CreateAddressDto): Promise<Address> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // ✅ If this is the first address, make it default
    const existingAddresses = await this.addressRepository.count({
      where: { user: { id: userId } },
    });

    if (existingAddresses === 0) {
      createAddressDto.isDefault = true;
    }

    // ✅ If marking as default, unset other defaults
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
   * ✅ Enhanced with sorting (default first)
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
   * ✅ Enhanced with ownership validation
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
   * ✅ Enhanced with default address handling
   */
  async updateAddress(
    userId: number, 
    addressId: number, 
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.getAddress(userId, addressId);

    // ✅ If marking as default, unset other defaults
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
   * ✅ Enhanced with default address protection
   */
  async deleteAddress(userId: number, addressId: number): Promise<void> {
    const address = await this.getAddress(userId, addressId);

    // ✅ Prevent deleting the last address if it's default
    const addressCount = await this.addressRepository.count({
      where: { user: { id: userId } },
    });

    if (addressCount === 1 && address.isDefault) {
      throw new BadRequestException(
        'Cannot delete the only address. Add another address first.',
      );
    }

    await this.addressRepository.remove(address);

    // ✅ If deleted address was default, set another as default
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
   * ✅ Enhanced with validation
   */
  async setDefaultAddress(userId: number, addressId: number): Promise<Address> {
    // ✅ Verify address belongs to user
    const address = await this.getAddress(userId, addressId);

    // ✅ Unset all defaults for this user
    await this.addressRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );

    // ✅ Set the new default
    address.isDefault = true;
    return this.addressRepository.save(address);
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get all users (admin only)
   * ✅ New method with pagination
   */
  async findAll(page: number = 1, limit: number = 20): Promise<{
    data: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.usersRepository.findAndCount({
      relations: ['addresses'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update user role (admin only)
   * ✅ New method for role management
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
   * ✅ New method for analytics
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
}