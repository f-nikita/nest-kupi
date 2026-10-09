import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Type } from 'class-transformer';
import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('wishes')
export class Wish {
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

  @Column({ type: 'varchar', length: 250 })
  @IsString({ message: 'Название подарка должно быть строкой' })
  @IsNotEmpty({ message: 'Название подарка не может быть пустым' })
  @Length(1, 250, {
    message: 'Название подарка должно быть от 1 до 250 символов',
  })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsString({ message: 'Ссылка должна быть строкой' })
  @IsNotEmpty({ message: 'Ссылка не должна быть пустой' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    { message: 'Укажите корректную ссылку на интернет-магазин' },
  )
  link: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @IsNotEmpty({ message: 'Ссылка на изображение не может быть пустой' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    { message: 'Ссылка на изображение должна быть валидным URL-адресом' },
  )
  image: string;

  @Column({
    type: 'decimal',
    precision: 10, // Общее количество цифр (до и после запятой)
    scale: 2, // Количество цифр после запятой (округление до сотых)
    transformer: {
      // Базы данных возвращают decimal как string, этот трансформер приводит его к number в JS
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Цена должна быть числом и иметь не более 2 знаков после запятой',
    },
  )
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  @Max(99999999.99, { message: 'Цена слишком велика' })
  @Type(() => Number) // Гарантирует преобразование входящего DTO-значения в тип Number
  price: number;

  @Column({
    type: 'decimal',
    precision: 10, // Общее количество цифр
    scale: 2, // Количество цифр после запятой (округление до сотых)
    default: 0.0,
    transformer: {
      // TypeORM по умолчанию возвращает decimal как string, это превратит его в number
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Сумма сбора должна быть числом и иметь не более 2 знаков после запятой',
    },
  )
  @Min(0, { message: 'Сумма сбора не может быть отрицательной' })
  raised: number;

  // Многие пожелания могут принадлежать одному пользователю
  @ManyToOne(() => User, (user) => user.wishes, { onDelete: 'CASCADE' })
  @ValidateNested()
  @Type(() => User) // Указывает class-transformer, в какой класс преобразовывать JSON
  owner: User;

  @IsString({ message: 'Описание должно быть строкой' })
  @MinLength(1, { message: 'Описание не должно быть пустым' })
  @MaxLength(1024, { message: 'Максимальная длина описания — 1024 символа' })
  description: string;

  @Column({ type: 'jsonb', default: [] }) // jsonb отлично подходит для PostgreSQL
  @IsArray()
  @ValidateNested() // Включает валидацию для каждого элемента массива
  @Type(() => Offer) // class-transformer: превращает обычный JS-объект в экземпляр класса Offer
  offers: Offer[];

  @Column('int', { default: 0 })
  copied: number;
}

// name — название подарка. Не может быть длиннее 250 символов и короче одного.
// link — ссылка на интернет-магазин, в котором можно приобрести подарок, строка.
// image ссылка на изображение подарка, строка. Должна быть валидным URL.
// price — стоимость подарка, с округлением до сотых, число.
// raised — сумма предварительного сбора или сумма, которую пользователи сейчас готовы скинуть на подарок. Также округляется до сотых.
// owner — ссылка на пользователя, который добавил пожелание подарка.
// description — строка с описанием подарка длиной от 1 и до 1024 символов.
// offers — массив ссылок на заявки скинуться от других пользователей.
// copied — содержит cчётчик тех, кто скопировал подарок себе. Целое десятичное число.
