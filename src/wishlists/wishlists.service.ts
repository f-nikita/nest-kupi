import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  async create(userId: number, createWishlistDto: CreateWishlistDto) {
    const owner = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!owner) {
      throw new NotFoundException(`Пользователь с id ${userId} не найден`);
    }

    const items = await this.wishRepository.findBy({
      id: In(createWishlistDto.items ?? []),
    });

    if (items.length !== (createWishlistDto.items ?? []).length) {
      throw new NotFoundException('Один или несколько подарков не найдены');
    }

    const wishlist = this.wishlistRepository.create({
      name: createWishlistDto.name,
      description: createWishlistDto.description,
      image: createWishlistDto.image,
      owner,
      items,
    });

    const savedWishlist = await this.wishlistRepository.save(wishlist);

    return this.wishlistRepository.find({
      where: { id: savedWishlist.id, owner: { id: userId } },
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  findAll(userId: number) {
    return this.wishlistRepository.find({
      where: { owner: { id: userId } },
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async findOne(wishlistId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: {
        owner: true,
        items: true,
      },
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist с id ${wishlistId} не найден`);
    }

    return wishlist;
  }

  async update(
    currentUserId: number,
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findOwnedWishlist(currentUserId, id);

    if (updateWishlistDto.items !== undefined) {
      const items = await this.wishRepository.findBy({
        id: In(updateWishlistDto.items),
      });

      if (items.length !== updateWishlistDto.items.length) {
        throw new NotFoundException('Один или несколько подарков не найдены');
      }

      wishlist.items = items;
    }

    wishlist.name = updateWishlistDto.name ?? wishlist.name;
    wishlist.description =
      updateWishlistDto.description ?? wishlist.description;
    wishlist.image = updateWishlistDto.image ?? wishlist.image;

    await this.wishlistRepository.save(wishlist);

    return this.findOne(id);
  }

  async remove(currentUserId: number, id: number) {
    const wishlist = await this.findOwnedWishlist(currentUserId, id);

    await this.wishlistRepository.remove(wishlist);
  }

  private async findOwnedWishlist(currentUserId: number, wishlistId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: { owner: true, items: true },
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist с id ${wishlistId} не найден`);
    }

    if (wishlist.owner.id !== currentUserId) {
      throw new ForbiddenException('Нельзя изменять чужой вишлист');
    }

    return wishlist;
  }
}
