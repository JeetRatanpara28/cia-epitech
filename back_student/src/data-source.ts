import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './entity/User';

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

const dev = process.env.NODE_ENV !== 'production';
const useSqlite = process.env.DB_TYPE === 'sqlite';

const options: DataSourceOptions = useSqlite
  ? {
      type: 'sqlite',
      database: process.env.DB_NAME || 'dev.sqlite',
      synchronize: true,
      logging: false,
      entities: [User],
      migrations: [],
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
      migrationsRun: dev,
      logging: false,
      entities: [User],
      migrations: ['src/migration/**/*.ts'],
      subscribers: [],
    };

export const AppDataSource = new DataSource(options);
