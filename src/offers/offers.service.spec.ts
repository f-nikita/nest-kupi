import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Offer } from './entities/offer.entity';
import { OffersService } from './offers.service';

describe('OffersService', () => {
  let service: OffersService;
  let wishRepository: Record<string, ReturnType<typeof jest.fn>>;
  let userRepository: Record<string, ReturnType<typeof jest.fn>>;
  let offerRepository: {
    findOne: ReturnType<typeof jest.fn>;
    remove: ReturnType<typeof jest.fn>;
    create: ReturnType<typeof jest.fn>;
    save: ReturnType<typeof jest.fn>;
    manager?: unknown;
  };

  beforeEach(() => {
    wishRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOneBy: jest.fn(),
    };
    offerRepository = {
      findOne: jest.fn(),
      remove: jest.fn(),
      create: jest.fn((data: unknown) => data),
      save: jest.fn(),
    };

    const transactionManager = {
      getRepository: (entity: typeof Wish | typeof User | typeof Offer) => {
        if (entity === Wish) return wishRepository;
        if (entity === User) return userRepository;
        return offerRepository;
      },
    };
    offerRepository.manager = {
      ...transactionManager,
      transaction: async <T>(
        callback: (manager: typeof transactionManager) => Promise<T>,
      ) => callback(transactionManager),
    };

    service = new OffersService(
      wishRepository as unknown as Repository<Wish>,
      userRepository as unknown as Repository<User>,
      offerRepository as unknown as Repository<Offer>,
    );
  });

  it('rejects an update of another user offer', async () => {
    offerRepository.findOne.mockResolvedValue({
      id: 1,
      user: { id: 1 },
      item: { id: 1, raised: 0 },
    });

    await expect(service.update(2, 1, {})).rejects.toThrow(ForbiddenException);
  });

  it('returns not found when the offer does not exist', async () => {
    offerRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, 1, {})).rejects.toThrow(NotFoundException);
  });

  it('rejects removal of another user offer', async () => {
    offerRepository.findOne.mockResolvedValue({
      id: 1,
      user: { id: 1 },
      item: { id: 1, raised: 0 },
    });

    await expect(service.remove(2, 1)).rejects.toThrow(ForbiddenException);
  });

  it('adds an offer amount to the wish raised total', async () => {
    const wish = { id: 1, raised: 10 };
    wishRepository.findOneBy.mockResolvedValue(wish);
    userRepository.findOneBy.mockResolvedValue({ id: 2 });
    offerRepository.save.mockResolvedValue({
      id: 3,
    });

    await service.create(2, { itemId: 1, amount: 15, hidden: false });

    expect(wish.raised).toBe(25);
    expect(wishRepository.save).toHaveBeenCalledWith(wish);
  });

  it('subtracts the offer amount when the offer is deleted', async () => {
    const wish = { id: 1, raised: 25 };
    const offer = { id: 3, amount: 15, user: { id: 2 }, item: wish };
    offerRepository.findOne.mockResolvedValue(offer);

    await service.remove(2, 3);

    expect(wish.raised).toBe(10);
    expect(wishRepository.save).toHaveBeenCalledWith(wish);
    expect(offerRepository.remove).toHaveBeenCalledWith(offer);
  });

  it('loads only the offer user and item for offer details', async () => {
    offerRepository.findOne.mockResolvedValue({ id: 1 });

    await service.findOne(1);

    expect(offerRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { item: true, user: true },
    });
  });
});
