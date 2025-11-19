


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
