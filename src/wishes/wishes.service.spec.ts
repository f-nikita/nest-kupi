import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wish } from './entities/wish.entity';
import { WishesService } from './wishes.service';

describe('WishesService', () => {
  let service: WishesService;
  let wishRepository: {
    findOne: ReturnType<typeof jest.fn>;
    findOneBy: ReturnType<typeof jest.fn>;
    remove: ReturnType<typeof jest.fn>;
    save: ReturnType<typeof jest.fn>;
    create: ReturnType<typeof jest.fn>;
    manager?: unknown;
  };
  let userRepository: { findOneBy: ReturnType<typeof jest.fn> };

  beforeEach(() => {
    wishRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: unknown) => data),
    };
    userRepository = { findOneBy: jest.fn() };

    const transactionManager = {
      getRepository: (entity: typeof Wish | typeof User) =>
        entity === Wish ? wishRepository : userRepository,
    };
    wishRepository.manager = {
      ...transactionManager,
      transaction: async <T>(
        callback: (manager: typeof transactionManager) => Promise<T>,
      ) => callback(transactionManager),
    };

    service = new WishesService(
      wishRepository as unknown as Repository<Wish>,
      userRepository as unknown as Repository<User>,
    );
  });

  it('allows the owner to update a wish', async () => {
    const wish = { id: 1, name: 'Старое имя', owner: { id: 1 } } as Wish;
    wishRepository.findOne.mockResolvedValue(wish);
    wishRepository.save.mockResolvedValue({ ...wish, name: 'Новое имя' });

    await expect(
      service.update(1, 1, { name: 'Новое имя' }),
    ).resolves.toMatchObject({ name: 'Новое имя' });
    expect(wishRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Новое имя' }),
    );
  });

  it('rejects an update of another user wish', async () => {
    wishRepository.findOne.mockResolvedValue({ id: 1, owner: { id: 1 } });

    await expect(service.update(2, 1, {})).rejects.toThrow(ForbiddenException);
  });

  it('returns not found when the wish does not exist', async () => {
    wishRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, 1, {})).rejects.toThrow(NotFoundException);
  });

  it('rejects removal of another user wish', async () => {
    wishRepository.findOne.mockResolvedValue({ id: 1, owner: { id: 1 } });

    await expect(service.remove(2, 1)).rejects.toThrow(ForbiddenException);
  });

  it('allows the owner to remove a wish', async () => {
    const wish = { id: 1, owner: { id: 1 } } as Wish;
    wishRepository.findOne.mockResolvedValue(wish);

    await service.remove(1, 1);

    expect(wishRepository.remove).toHaveBeenCalledWith(wish);
  });

  it('increments copied on the original wish when it is copied', async () => {
    const originalWish = {
      id: 1,
      name: 'Книга',
      link: 'https://example.com',
      image: 'https://example.com/image.png',
      price: 100,
      description: 'Описание',
      copied: 2,
    };
    wishRepository.findOneBy.mockResolvedValue(originalWish);
    userRepository.findOneBy.mockResolvedValue({ id: 2 });
    wishRepository.save.mockImplementation((wish: unknown) => wish);

    await service.copy(2, 1);

    expect(originalWish.copied).toBe(3);
    expect(wishRepository.save).toHaveBeenCalledWith(originalWish);
  });
});
