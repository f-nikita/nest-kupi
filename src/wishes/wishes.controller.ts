import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { WishesService } from './wishes.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    username: string;
  };
}

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createWishDto: CreateWishDto,
  ) {
    return this.wishesService.create(req.user.userId, createWishDto);
  }

  @Get('last')
  @UseGuards(JwtAuthGuard)
  findLastWish(@Req() req: AuthenticatedRequest) {
    return this.wishesService.findLastWish(req.user.userId);
  }

  @Get('top')
  @UseGuards(JwtAuthGuard)
  findFirstWish(@Req() req: AuthenticatedRequest) {
    return this.wishesService.findFirstWish(req.user.userId);
  }

  @Get()
  findAll() {
    return this.wishesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return this.wishesService.update(id, updateWishDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.remove(id);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  copy(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) wishId: number,
  ) {
    return this.wishesService.copy(req.user.userId, wishId);
  }
}
