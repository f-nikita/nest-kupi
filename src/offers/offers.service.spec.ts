import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Offer } from './entities/offer.entity';
import { OffersService } from './offers.service';

describe('OffersService', () => {
  let service: OffersService;
  let offerRepository: {
    findOne: ReturnType<typeof jest.fn>;
    remove: ReturnType<typeof jest.fn>;
  };

  beforeEach(() => {
    offerRepository = {
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    service = new OffersService(
      {} as Repository<Wish>,
      {} as Repository<User>,
      offerRepository as unknown as Repository<Offer>,
    );
  });

  it('rejects an update of another user offer', async () => {
    offerRepository.findOne.mockResolvedValue({
      id: 1,
      user: { id: 1 },
    });

    await expect(service.update(2, 1, {})).rejects.toThrow(ForbiddenException);
  });

  it('returns not found when the offer does not exist', async () => {
    offerRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, 1, {})).rejects.toThrow(NotFoundException);
  });

  it('rejects removal of another user offer', async () => {
    offerRepository.findOne.mockResolvedValue({ id: 1, user: { id: 1 } });

    await expect(service.remove(2, 1)).rejects.toThrow(ForbiddenException);
  });
});
