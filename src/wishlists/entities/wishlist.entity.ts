import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Wish } from 'src/wishes/entities/wish.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wishlists')
export class Wishlist {
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
    length: 250, // Ограничение в БД: VARCHAR(250)
  })
  @IsNotEmpty({ message: 'Название списка не может быть пустым' })
  @IsString({ message: 'Название должно быть строкой' })
  @Length(1, 250, {
    message: 'Название списка должно быть от 1 до 250 символов',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 1500, // Ограничение на уровне базы данных
    nullable: true, // Поле может быть пустым в БД, если описание необязательно
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(1500, {
    message: 'Описание подборки не может быть длиннее 1500 символов',
  })
  description: string;

  @Column({
    type: 'varchar',
    default: 'https://pravatar.cc', // Можно задать дефолтную заглушку для обложки
  })
  @IsOptional()
  @IsUrl({}, { message: 'Обложка должна быть валидной ссылкой URL' })
  image: string;

  @ManyToMany(() => Wish)
  @JoinTable() // Обязательный декоратор для создания связующей таблицы в БД
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Wish)
  items: Wish[];
}

// name — название списка. Не может быть длиннее 250 символов и короче одного;
// description — описание подборки, строка до 1500 символов;
// image — обложка для подборки;
// items содержит набор ссылок на подарки.
