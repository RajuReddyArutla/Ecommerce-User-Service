// // src/user/dto/update-profile.dto.ts
// import { IsOptional, IsString, Length } from 'class-validator';

// export class UpdateProfileDto {
//   @IsOptional()
//   @IsString()
//   @Length(2, 100)
//   firstName?: string;

//   @IsOptional()
//   @IsString()
//   @Length(2, 100)
//   lastName?: string;

//   // You might add an optional field for profile picture, etc.
//   // @IsOptional()
//   // @IsUrl()
//   // profileImageUrl?: string;
// }

// src/user/dto/update-profile.dto.ts
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  // You might add an optional field for profile picture, etc.
  // @IsOptional()
  // @IsUrl()
  // profileImageUrl?: string;
}