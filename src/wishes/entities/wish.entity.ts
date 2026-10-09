import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('wishes')
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Автоматически обновляемая колонка в TypeORM
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  link: string;

  @Column({ type: 'varchar', length: 255 })
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
  raised: number;

  // Многие пожелания могут принадлежать одному пользователю
  @ManyToOne(() => User, (user) => user.wishes, { onDelete: 'CASCADE' })
  owner: User;

  @Column({ type: 'varchar', length: 1024 })
  description: string;

  @OneToMany(() => Offer, (offer) => offer.item)
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
