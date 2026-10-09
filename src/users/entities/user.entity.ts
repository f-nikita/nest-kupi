import {
  IsArray,
  IsDate,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Type } from 'class-transformer';
import { Offer } from 'src/offers/entities/offer.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsOptional() // Поле опционально при создании (DTO), так как БД генерирует его сама
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  @IsDate()
  @IsOptional() // Необязательно при создании, так как база или TypeORM заполнят его сами
  createdAt: Date;

  // Автоматически обновляемая колонка в TypeORM
  @UpdateDateColumn({ type: 'timestamp' })
  @IsOptional() // Позволяет не передавать поле при создании (TypeORM заполнит сам)
  @Type(() => Date) // Преобразует строку/число из JSON в объект Date
  @IsDate() // Проверяет, что итоговое значение является валидным объектом Date
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
  })
  @Length(2, 30)
  username: string;

  @Column({
    type: 'varchar',
    length: 200,
    default: 'Пока ничего не рассказал о себе',
  })
  @Length(2, 200)
  about: string;

  @Column({
    type: 'varchar',
    default: 'https://i.pravatar.cc/300',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Аватар должен быть валидной ссылкой URL' })
  avatar: string;

  @Column({
    type: 'varchar',
    unique: true, // Гарантирует уникальность email на уровне базы данных
  })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат адреса электронной почты' })
  email: string;

  @Column({
    type: 'varchar',
    select: false, // Пароль не будет выбираться из базы по умолчанию
  })
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  // Один пользователь может добавить много пожеланий подарков
  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Offer)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.items)
  @IsArray({ message: 'Wishlists должен быть массивом' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Wishlist)
  wishlists: Wishlist[];
}

// id — уникальный числовой идентификатор. Генерируется автоматически и является первичным ключем каждой из таблиц;
// createdAt — дата создания, тип значения Date;
// updatedAt — дата изменения, тип значения Date.
// Схема пользователя (user):
// username — имя пользователя, уникальная строка от 2 до 30 символов, обязательное поле.
// about — **информация о пользователе, строка от 2 до 200 символов. В качестве значения по умолчанию укажите для него строку: «Пока ничего не рассказал о себе».
// avatar — ссылка на аватар. В качестве значения по умолчанию задайте https://i.pravatar.cc/300
// email — адрес электронной почты пользователя, должен быть уникален.
// password — пароль пользователя, строка.
// wishes — список желаемых подарков. Используйте для него соответствующий тип связи.
// offers — содержит список подарков, на которые скидывается пользователь. Установите для него подходящий тип связи.
// wishlists содержит список вишлистов, которые создал пользователь. Установите для него подходящий тип связи.
