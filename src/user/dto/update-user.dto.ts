import { PartialType } from '@nestjs/mapped-types';

import { IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // ✅ Allow updating role (admin only in controller)
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}