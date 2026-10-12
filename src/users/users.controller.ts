import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryPost } from './dto/serach-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    username: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30, must-revalidate')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30, must-revalidate')
  findMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('/me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(
      req.user.userId,
      req.user.userId,
      updateUserDto,
    );
  }

  @Get('/me/wishes')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30, must-revalidate')
  findMyWishes(@Req() req: AuthenticatedRequest) {
    return this.usersService.findMyWishes(req.user.userId);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30, must-revalidate')
  findSomeUser(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Get(':username/wishes')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=30, must-revalidate')
  findOneWishesByUsername(@Param('username') username: string) {
    return this.usersService.findOneWishesByUsername(username);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.userId, id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.remove(req.user.userId, id);
  }

  @Post('find')
  @UseGuards(JwtAuthGuard)
  findByQuery(@Body() queryDto: QueryPost) {
    return this.usersService.findByQuery(queryDto);
  }
}
