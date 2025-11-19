// // src/user/entities/user.entity.ts (user-service)
// import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
// import { Address } from './address.entity';

// // IMPORTANT: Since Auth Service creates the user, we use PrimaryColumn here, 
// // assuming the Auth Service will communicate the user ID upon creation.
// @Entity('users')
// export class User {
//   @PrimaryColumn() // Use PrimaryColumn instead of PrimaryGeneratedColumn
//   id: number;

//   @Column({ length: 100 })
//   firstName: string;

//   @Column({ length: 100 })
//   lastName: string;

//   @Column({ unique: true, length: 255 })
//   email: string;

//   @OneToMany(() => Address, address => address.user)
//   addresses: Address[]; 

//   // Other profile fields like profile picture URL, phone number, etc.
// }



// import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { Address } from './address.entity';

// @Entity('users')
// export class User {
//   @PrimaryGeneratedColumn() // ✅ This generates integer IDs
//   id: number; // ✅ MUST be number, not string

//   @Column()
//   firstName: string;

//   @Column()
//   lastName: string;

//   @Column({ unique: true })
//   email: string;

//   @Column({ select: false })
//   password: string;

//   @Column({ nullable: true })
//   refreshToken: string;

//   @Column({ default: 'user' })
//   role: string;

//   @Column({ nullable: true })
//   googleId: string;

//   @Column({ default: false })
//   isGoogleUser: boolean;

//   @OneToMany(() => Address, address => address.user)
//   addresses: Address[];
// }


import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Address } from './address.entity';

// ✅ Role Enum - Shared across services
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  // ✅ UPDATED: Use enum instead of string
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: false })
  isGoogleUser: boolean;

  // ✅ BEST PRACTICE: Add timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Address, address => address.user, { cascade: true })
  addresses: Address[];

  // ✅ BEST PRACTICE: Add computed property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}