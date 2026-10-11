import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async update(
    currentUserId: number,
    id: number,
    updateOfferDto: UpdateOfferDto,
  ) {
    const offer = await this.findOwnedOffer(currentUserId, id);

    if (updateOfferDto.itemId !== undefined) {
      const item = await this.wishRepository.findOneBy({
        id: updateOfferDto.itemId,
      });

      if (!item) {
        throw new NotFoundException(
          `Подарок с id ${updateOfferDto.itemId} не найден`,
        );
      }

      offer.item = item;
    }

    offer.amount = updateOfferDto.amount ?? offer.amount;
    offer.hidden = updateOfferDto.hidden ?? offer.hidden;

    return this.offerRepository.save(offer);
  }

  async remove(currentUserId: number, id: number) {
    const offer = await this.findOwnedOffer(currentUserId, id);

    await this.offerRepository.remove(offer);
  }

  private async findOwnedOffer(currentUserId: number, offerId: number) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: { user: true },
    });

    if (!offer) {
      throw new NotFoundException(`Предложение с id ${offerId} не найдено`);
    }

    if (offer.user.id !== currentUserId) {
      throw new ForbiddenException('Нельзя изменять чужое предложение');
    }

    return offer;
  }
}
