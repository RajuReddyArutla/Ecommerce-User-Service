
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


  @Column({ default: true })
  isActive: boolean;

  // ✅ BEST PRACTICE: Add computed property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}


