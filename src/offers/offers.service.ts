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
    return this.offerRepository.manager.transaction(async (manager) => {
      const wishRepository = manager.getRepository(Wish);
      const userRepository = manager.getRepository(User);
      const offerRepository = manager.getRepository(Offer);
      const wish = await wishRepository.findOneBy({
        id: createOfferDto.itemId,
      });

      if (!wish) {
        throw new NotFoundException(
          `Подарок с id ${createOfferDto.itemId} не найден`,
        );
      }

      const user = await userRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException(`Пользователь с id ${userId} не найден`);
      }

      const { itemId: _itemId, ...offerData } = createOfferDto;
      const offer = offerRepository.create({
        ...offerData,
        user,
        item: wish,
      });

      this.changeRaised(wish, offer.amount);
      await wishRepository.save(wish);
      return offerRepository.save(offer);
    });
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
        user: true,
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
    return this.offerRepository.manager.transaction(async (manager) => {
      const offerRepository = manager.getRepository(Offer);
      const wishRepository = manager.getRepository(Wish);
      const offer = await this.findOwnedOffer(
        currentUserId,
        id,
        offerRepository,
      );
      const previousItem = offer.item;
      const previousAmount = offer.amount;

      let nextItem = previousItem;
      if (updateOfferDto.itemId !== undefined) {
        const item = await wishRepository.findOneBy({
          id: updateOfferDto.itemId,
        });

        if (!item) {
          throw new NotFoundException(
            `Подарок с id ${updateOfferDto.itemId} не найден`,
          );
        }

        nextItem = item;
      }

      const nextAmount = updateOfferDto.amount ?? previousAmount;

      if (previousItem.id === nextItem.id) {
        this.changeRaised(previousItem, nextAmount - previousAmount);
        await wishRepository.save(previousItem);
      } else {
        this.changeRaised(previousItem, -previousAmount);
        this.changeRaised(nextItem, nextAmount);
        await wishRepository.save([previousItem, nextItem]);
      }

      offer.item = nextItem;
      offer.amount = nextAmount;
      offer.hidden = updateOfferDto.hidden ?? offer.hidden;

      return offerRepository.save(offer);
    });
  }

  async remove(currentUserId: number, id: number) {
    await this.offerRepository.manager.transaction(async (manager) => {
      const offerRepository = manager.getRepository(Offer);
      const wishRepository = manager.getRepository(Wish);
      const offer = await this.findOwnedOffer(
        currentUserId,
        id,
        offerRepository,
      );

      this.changeRaised(offer.item, -offer.amount);
      await wishRepository.save(offer.item);
      await offerRepository.remove(offer);
    });
  }

  private async findOwnedOffer(
    currentUserId: number,
    offerId: number,
    offerRepository: Repository<Offer> = this.offerRepository,
  ) {
    const offer = await offerRepository.findOne({
      where: { id: offerId },
      relations: { user: true, item: true },
    });

    if (!offer) {
      throw new NotFoundException(`Предложение с id ${offerId} не найдено`);
    }

    if (offer.user.id !== currentUserId) {
      throw new ForbiddenException('Нельзя изменять чужое предложение');
    }

    return offer;
  }

  private changeRaised(wish: Wish, amountDifference: number) {
    const raisedInCents = Math.round(Number(wish.raised) * 100);
    const differenceInCents = Math.round(Number(amountDifference) * 100);

    wish.raised = (raisedInCents + differenceInCents) / 100;
  }
}
