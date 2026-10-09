import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wishlists')
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Автоматически обновляемая колонка в TypeORM
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: 250, // Ограничение в БД: VARCHAR(250)
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 1500, // Ограничение на уровне базы данных
    nullable: true, // Поле может быть пустым в БД, если описание необязательно
  })
  description: string;

  @Column({
    type: 'varchar',
    default: 'https://pravatar.cc', // Можно задать дефолтную заглушку для обложки
  })
  image?: string;

  @ManyToMany(() => Wish)
  @JoinTable() // Обязательный декоратор для создания связующей таблицы в БД
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}

// name — название списка. Не может быть длиннее 250 символов и короче одного;
// description — описание подборки, строка до 1500 символов;
// image — обложка для подборки;
// items содержит набор ссылок на подарки.
