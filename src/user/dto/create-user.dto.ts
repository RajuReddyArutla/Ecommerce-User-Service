import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsNotEmpty, 
  MinLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsBoolean()
  isGoogleUser?: boolean;

  // ✅ NEW: Role field with validation
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}