import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async update(
    currentUserId: number,
    id: number,
    updateWishDto: UpdateWishDto,
  ) {
    const wish = await this.findOwnedWish(currentUserId, id);

    Object.assign(wish, updateWishDto);
    return this.wishRepository.save(wish);
  }

  async remove(currentUserId: number, id: number) {
    const wish = await this.findOwnedWish(currentUserId, id);

    await this.wishRepository.remove(wish);
  }

  private async findOwnedWish(currentUserId: number, wishId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });

    if (!wish) {
      throw new NotFoundException(`Подарок с id ${wishId} не найден`);
    }

    if (wish.owner.id !== currentUserId) {
      throw new ForbiddenException('Нельзя изменять чужой подарок');
    }

    return wish;
  }

  async copy(userId: number, wishId: number) {
    return this.wishRepository.manager.transaction(async (manager) => {
      const wishRepository = manager.getRepository(Wish);
      const userRepository = manager.getRepository(User);
      const wish = await wishRepository.findOneBy({ id: wishId });

      if (!wish) {
        throw new NotFoundException(`Подарок с id ${wishId} не найден`);
      }

      const owner = await userRepository.findOneBy({ id: userId });

      if (!owner) {
        throw new NotFoundException(`Пользователь с id ${userId} не найден`);
      }

      const copiedWish = wishRepository.create({
        name: wish.name,
        link: wish.link,
        image: wish.image,
        price: wish.price,
        raised: 0,
        description: wish.description,
        copied: 0,
        owner,
      });

      wish.copied += 1;
      await wishRepository.save(wish);
      return wishRepository.save(copiedWish);
    });
  }
}
