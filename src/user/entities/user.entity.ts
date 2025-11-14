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



import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Address } from './address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() // ✅ This generates integer IDs
  id: number; // ✅ MUST be number, not string

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: false })
  isGoogleUser: boolean;

  @OneToMany(() => Address, address => address.user)
  addresses: Address[];
}