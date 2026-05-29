import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Order } from './entity/Order';
import { Product } from './entity/Product';
import { User } from './entity/User';

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

const dev = process.env.NODE_ENV !== 'production';
const useSqlite = process.env.DB_TYPE === 'sqlite';
const usePostgres = !!process.env.DATABASE_URL;

const options: DataSourceOptions = useSqlite
  ? {
      type: 'sqlite',
      database: process.env.DB_NAME || 'dev.sqlite',
      synchronize: true,
      logging: false,
      entities: [User, Product, Order],
      migrations: [],
      subscribers: [],
    }
  : usePostgres
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      synchronize: false,
      migrationsRun: true,
      logging: false,
      entities: [User, Product, Order],
      migrations: [__dirname + '/migration/*.js'],
      subscribers: [],
    }
  : {
      type: 'mysql',
      host: env('DB_HOST'),
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: env('DB_USER'),
      password: env('DB_PASS'),
      database: env('DB_NAME'),
      synchronize: dev,
      migrationsRun: true,
      logging: false,
      entities: [User, Product, Order],
      migrations: [__dirname + '/migration/*.js'],
      subscribers: [],
    };

export const AppDataSource = new DataSource(options);
