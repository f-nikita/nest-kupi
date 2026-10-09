import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  ValidateNested,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('offers')
export class Offer {
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

  @ManyToOne(() => User, (user) => user.offers, {
    onDelete: 'CASCADE', // Если пользователь удалится, его офферы тоже удалятся
    nullable: false, // Оффер не может существовать без пользователя
  })
  @ValidateNested()
  @Type(() => User)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers, {
    onDelete: 'CASCADE', // Если подарок удалится, взносы на него тоже удалятся
    nullable: false, // Взнос не может существовать без привязки к подарку
  })
  @ValidateNested()
  @Type(() => Wish)
  item: Wish;

  @Column({
    type: 'decimal',
    precision: 10, // Общее количество цифр в числе
    scale: 2, // Количество знаков после запятой
    transformer: {
      // Преобразует строку из БД в число для JS/TS
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Сумма должна быть числом и содержать не более 2 знаков после запятой',
    },
  )
  @IsPositive({ message: 'Сумма взноса должна быть больше нуля' })
  @Max(999999, { message: 'Сумма взноса слишком велика' })
  amount: number;

  @Column({
    type: 'boolean',
    default: false, // По умолчанию информация о пользователе открыта
  })
  @IsOptional()
  @IsBoolean({
    message: 'Значение поля hidden должно быть логического типа (true/false)',
  })
  hidden: boolean;
}

// user содержит id желающего скинуться;
// item содержит ссылку на товар;
// amount — сумма заявки, округляется до двух знаков после запятой;
// hidden — флаг, который определяет показывать ли информацию о скидывающемся в списке. По умолчанию равен false.
