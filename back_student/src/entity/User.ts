import {compareSync, hashSync} from 'bcryptjs';
import {Exclude} from 'class-transformer';
import {IsIn, IsNotEmpty, Length, Matches} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

const SALT_ROUNDS = 12;

// at least one lower, one upper, one digit, one symbol
const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

@Entity()
@Unique(['username'])
export class User {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Length(3, 32)
  @Matches(/^[A-Za-z0-9_.-]+$/, {message: 'invalid username'})
  public username: string;

  @Column()
  @Exclude()
  @Length(12, 128, {message: 'password must be 12-128 chars'})
  @Matches(pwRegex, {message: 'password needs upper, lower, digit and symbol'})
  public password: string;

  @Column()
  @IsNotEmpty()
  @IsIn(['NORMAL', 'ADMIN'])
  public role: string;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;

  public hashPassword() {
    this.password = hashSync(this.password, SALT_ROUNDS);
  }

  public checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return compareSync(unencryptedPassword, this.password);
  }
}
