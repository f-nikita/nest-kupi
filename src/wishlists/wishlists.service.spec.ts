import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistsService } from './wishlists.service';

describe('WishlistsService', () => {
  let service: WishlistsService;
  let wishlistRepository: {
    findOne: ReturnType<typeof jest.fn>;
    find: ReturnType<typeof jest.fn>;
    create: ReturnType<typeof jest.fn>;
    save: ReturnType<typeof jest.fn>;
    remove: ReturnType<typeof jest.fn>;
  };
  let cacheManager: {
    get: ReturnType<typeof jest.fn>;
    set: ReturnType<typeof jest.fn>;
    del: ReturnType<typeof jest.fn>;
  };

  beforeEach(() => {
    wishlistRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data: unknown) => data),
      save: jest.fn(),
      remove: jest.fn(),
    };
    cacheManager = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    service = new WishlistsService(
      {} as Repository<Wish>,
      {} as Repository<User>,
      wishlistRepository as unknown as Repository<Wishlist>,
      cacheManager as unknown as Cache,
    );
  });

  it('rejects an update of another user wishlist', async () => {
    wishlistRepository.findOne.mockResolvedValue({
      id: 1,
      owner: { id: 1 },
      items: [],
    });

    await expect(service.update(2, 1, {})).rejects.toThrow(ForbiddenException);
  });

  it('returns not found when the wishlist does not exist', async () => {
    wishlistRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, 1, {})).rejects.toThrow(NotFoundException);
  });

  it('rejects removal of another user wishlist', async () => {
    wishlistRepository.findOne.mockResolvedValue({
      id: 1,
      owner: { id: 1 },
      items: [],
    });

    await expect(service.remove(2, 1)).rejects.toThrow(ForbiddenException);
  });

  it('returns only wishlists belonging to the current user', async () => {
    wishlistRepository.find.mockResolvedValue([]);

    await service.findAll(7);

    expect(wishlistRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { owner: { id: 7 } } }),
    );
  });

  it('returns cached wishlists for the current user without querying the database', async () => {
    const cachedWishlists = [{ id: 1 }];
    cacheManager.get.mockResolvedValue(cachedWishlists);

    await expect(service.findAll(7)).resolves.toEqual(cachedWishlists);

    expect(wishlistRepository.find).not.toHaveBeenCalled();
  });

  it('stores a wishlist in cache after loading its details', async () => {
    const wishlist = { id: 1, owner: { id: 2 }, items: [] };
    wishlistRepository.findOne.mockResolvedValue(wishlist);

    await service.findOne(1);

    expect(cacheManager.set).toHaveBeenCalledWith('wishlist:1', wishlist);
  });
});
