import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import {
  getUserWishlistsCacheKey,
  getWishlistCacheKey,
} from 'src/cache/cache.constants';
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

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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

    await this.invalidateWishlistCache(userId, savedWishlist.id);

    return this.wishlistRepository.find({
      where: { id: savedWishlist.id, owner: { id: userId } },
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async findAll(userId: number) {
    const cacheKey = getUserWishlistsCacheKey(userId);
    const cachedWishlists = await this.cacheManager.get<Wishlist[]>(cacheKey);

    if (cachedWishlists) {
      return cachedWishlists;
    }

    const wishlists = await this.wishlistRepository.find({
      where: { owner: { id: userId } },
      relations: {
        owner: true,
        items: true,
      },
    });

    await this.cacheManager.set(cacheKey, wishlists);
    return wishlists;
  }

  async findOne(wishlistId: number) {
    const cacheKey = getWishlistCacheKey(wishlistId);
    const cachedWishlist = await this.cacheManager.get<Wishlist>(cacheKey);

    if (cachedWishlist) {
      return cachedWishlist;
    }

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

    await this.cacheManager.set(cacheKey, wishlist);
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
    await this.invalidateWishlistCache(currentUserId, id);

    return this.findOne(id);
  }

  async remove(currentUserId: number, id: number) {
    const wishlist = await this.findOwnedWishlist(currentUserId, id);

    await this.wishlistRepository.remove(wishlist);
    await this.invalidateWishlistCache(currentUserId, id);
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

  private async invalidateWishlistCache(userId: number, wishlistId: number) {
    await this.cacheManager.del(getUserWishlistsCacheKey(userId));
    await this.cacheManager.del(getWishlistCacheKey(wishlistId));
  }
}
