import {IsNotEmpty, Length, Min} from 'class-validator';
import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Product} from './Product';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @IsNotEmpty()
  @Length(1, 100)
  public name: string;

  @ManyToOne(() => Product, {eager: true})
  @JoinColumn()
  public product: Product;

  @Column()
  @Min(1)
  public amount: number;

  @Column({type: 'float'})
  @Min(0)
  public totalPrice: number;
}
