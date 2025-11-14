// // src/user/dto/create-address.dto.ts
// import { IsNotEmpty, IsString, IsPostalCode, IsBoolean, IsOptional } from 'class-validator';

// export class CreateAddressDto {
//   @IsNotEmpty()
//   @IsString()
//   street: string;

//   @IsNotEmpty()
//   @IsString()
//   city: string;

//   @IsNotEmpty()
//   @IsString()
//   state: string;

//   @IsNotEmpty()
//   @IsString()
//   @IsPostalCode('any') // 'any' for general postal code validation
//   zipCode: string;

//   @IsOptional()
//   @IsBoolean()
//   isDefault?: boolean = false;
// }




// src/user/dto/create-address.dto.ts
import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// Also used as CreateUserDto for microservice communication
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}