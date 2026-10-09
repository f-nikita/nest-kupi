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
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Автоматически обновляемая колонка в TypeORM
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.offers, {
    onDelete: 'CASCADE', // Если пользователь удалится, его офферы тоже удалятся
    nullable: false, // Оффер не может существовать без пользователя
  })
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers, {
    onDelete: 'CASCADE', // Если подарок удалится, взносы на него тоже удалятся
    nullable: false, // Взнос не может существовать без привязки к подарку
  })
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
  amount: number;

  @Column({
    type: 'boolean',
    default: false, // По умолчанию информация о пользователе открыта
  })
  hidden: boolean;
}

// user содержит id желающего скинуться;
// item содержит ссылку на товар;
// amount — сумма заявки, округляется до двух знаков после запятой;
// hidden — флаг, который определяет показывать ли информацию о скидывающемся в списке. По умолчанию равен false.
