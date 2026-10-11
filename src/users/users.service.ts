import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { ILike, QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryPost } from './dto/serach-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 12);

      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });
      const savedUser = await this.userRepository.save(user);

      const { password: _password, ...result } = savedUser;

      return result;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Пользователь с таким email или именем уже существует',
        );
      }

      throw error;
    }
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    return user;
  }

  async findMyWishes(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { wishes: true },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    return user.wishes;
  }

  async update(
    currentUserId: number,
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.findOwnedUser(currentUserId, id);

    const userData = { ...updateUserDto };

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    Object.assign(user, userData);
    await this.userRepository.save(user);

    return this.findOne(id);
  }

  async remove(currentUserId: number, id: number) {
    const user = await this.findOwnedUser(currentUserId, id);
    await this.userRepository.remove(user);
  }

  async findOneByUsername(usernamePerson: string) {
    const user = await this.userRepository.findOne({
      where: {
        username: usernamePerson,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Пользователь с username ${usernamePerson} не найден`,
      );
    }

    return user;
  }

  async findOneWishesByUsername(usernamePerson: string) {
    const user = await this.userRepository.findOne({
      where: {
        username: usernamePerson,
      },
      relations: { wishes: true },
    });

    if (!user) {
      throw new NotFoundException(
        `Пользователь с username ${usernamePerson} не найден`,
      );
    }

    return user.wishes;
  }

  async findByQuery({ query }: QueryPost) {
    return this.userRepository.find({
      where: [
        {
          username: ILike(`%${query}%`),
        },
        {
          email: ILike(`%${query}%`),
        },
      ],
    });
  }

  private async findOwnedUser(currentUserId: number, userId: number) {
    const user = await this.findOne(userId);

    if (user.id !== currentUserId) {
      throw new ForbiddenException('Нельзя изменять чужой профиль');
    }

    return user;
  }
}
