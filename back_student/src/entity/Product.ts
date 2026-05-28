import {IsBoolean, IsNotEmpty, Length, Min} from 'class-validator';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @IsNotEmpty()
  @Length(1, 100)
  public name: string;

  @Column()
  @IsNotEmpty()
  @Length(1, 50)
  public category: string;

  @Column({nullable: true, default: ''})
  @Length(0, 255)
  public description: string;

  @Column({default: 0})
  @Min(0)
  public amount: number;

  @Column({type: 'float', default: 0})
  @Min(0)
  public price: number;

  @Column({default: false})
  @IsBoolean()
  public hasExpiryDate: boolean;
}
