import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    findOneBy: ReturnType<typeof jest.fn>;
    remove: ReturnType<typeof jest.fn>;
  };

  beforeEach(() => {
    userRepository = {
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };
    service = new UsersService(userRepository as unknown as Repository<User>);
  });

  it('rejects an update of another user profile', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: 1 });

    await expect(service.update(2, 1, {})).rejects.toThrow(ForbiddenException);
  });

  it('returns not found when the user profile does not exist', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, 1, {})).rejects.toThrow(NotFoundException);
  });

  it('rejects removal of another user profile', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: 1 });

    await expect(service.remove(2, 1)).rejects.toThrow(ForbiddenException);
  });
});
