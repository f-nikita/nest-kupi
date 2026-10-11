import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: number, createWishDto: CreateWishDto) {
    const owner = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!owner) {
      throw new NotFoundException(`Пользователь с id ${userId} не найден`);
    }

    const wish = this.wishRepository.create({
      ...createWishDto,
      owner,
    });

    await this.wishRepository.save(wish);

    return;
  }

  findLastWish(userId: number) {
    return this.wishRepository.findOne({
      where: {
        owner: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findFirstWish(userId: number) {
    return this.wishRepository.findOne({
      where: {
        owner: {
          id: userId,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  findAll() {
    return this.wishRepository.find({});
  }

  async findOne(id: number) {
    const wish = await this.wishRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException(`Подарок с id ${id} не найден`);
    }

    return wish;
  }

  async update(id: number, updateWishDto: UpdateWishDto) {
    const wish = await this.wishRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException(`Подарок с id ${id} не найден`);
    }

    await this.wishRepository.update(id, updateWishDto);

    return this.findOne(id);
  }

  async remove(id: number) {
    const wish = await this.wishRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException(`Подарок с id ${id} не найден`);
    }

    await this.wishRepository.delete(id);
  }

  async copy(userId: number, wishId: number) {
    const wish = await this.wishRepository.findOneBy({ id: wishId });

    if (!wish) {
      throw new NotFoundException(`Подарок с id ${wishId} не найден`);
    }

    const owner = await this.userRepository.findOneBy({ id: userId });

    if (!owner) {
      throw new NotFoundException(`Пользователь с id ${userId} не найден`);
    }

    const copiedWish = this.wishRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      raised: 0,
      description: wish.description,
      copied: 0,
      owner,
    });

    return this.wishRepository.save(copiedWish);
  }
}
