import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Offer } from '../offers/entities/offer.entity';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Wishlist } from '../wishlists/entities/wishlist.entity';

config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Переменная окружения ${name} не задана`);
  }

  return value;
}

export default new DataSource({
  type: 'postgres',
  host: getRequiredEnv('DB_HOST'),
  port: Number(getRequiredEnv('DB_PORT')),
  username: getRequiredEnv('DB_USERNAME'),
  password: getRequiredEnv('DB_PASSWORD'),
  database: getRequiredEnv('DB_NAME'),
  schema: process.env.DB_SCHEMA,
  extra: process.env.DB_SCHEMA
    ? { options: `-c search_path=${process.env.DB_SCHEMA}` }
    : undefined,
  entities: [User, Offer, Wish, Wishlist],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
});
