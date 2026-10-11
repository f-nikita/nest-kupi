import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  async create(userId: number, createOfferDto: CreateOfferDto) {
    const wish = await this.wishRepository.findOneBy({
      id: createOfferDto.itemId,
    });

    if (!wish) {
      throw new NotFoundException(
        `Подарок с id ${createOfferDto.itemId} не найден`,
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${userId} не найден`);
    }

    const offer = this.offerRepository.create({
      ...createOfferDto,
      user,
      item: wish,
    });

    return this.offerRepository.save(offer);
  }

  async findAll(userId: number) {
    return this.offerRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        item: true,
        user: true,
      },
    });
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: {
        item: true,
        user: {
          wishes: true,
          offers: true,
          wishlists: {
            owner: true,
            items: true,
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException(`Предложение с id ${id} не найдено`);
    }

    return offer;
  }

  async update(id: number, updateOfferDto: UpdateOfferDto) {
    const wish = await this.offerRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException(`Подарок с id ${id} не найден`);
    }

    await this.offerRepository.update(id, updateOfferDto);

    return this.findOne(id);
  }

  async remove(id: number) {
    const offer = await this.offerRepository.findOneBy({ id });

    if (!offer) {
      throw new NotFoundException(`Подарок с id ${id} не найден`);
    }

    await this.offerRepository.delete(id);
  }
}
