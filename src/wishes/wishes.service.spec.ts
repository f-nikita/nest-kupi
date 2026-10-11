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
    remove: ReturnType<typeof jest.fn>;
    save: ReturnType<typeof jest.fn>;
  };

  beforeEach(() => {
    wishRepository = {
      findOne: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
    };
    service = new WishesService(
      wishRepository as unknown as Repository<Wish>,
      {} as Repository<User>,
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
});
