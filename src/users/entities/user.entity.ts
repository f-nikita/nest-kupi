import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Offer } from 'src/offers/entities/offer.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Автоматически обновляемая колонка в TypeORM
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 200,
    default: 'Пока ничего не рассказал о себе',
  })
  about: string;

  @Column({
    type: 'varchar',
    default: 'https://i.pravatar.cc/300',
  })
  avatar: string;

  @Column({
    type: 'varchar',
    unique: true, // Гарантирует уникальность email на уровне базы данных
  })
  email: string;

  @Column({
    type: 'varchar',
    select: false, // Пароль не будет выбираться из базы по умолчанию
  })
  password: string;

  // Один пользователь может добавить много пожеланий подарков
  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
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
