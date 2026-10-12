import { Body, Controller, Get, Header, Post, Req } from '@nestjs/common';

import { Request } from 'express';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';

type CsrfRequest = Request & {
  csrfToken: () => string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('csrf-token')
  @Header('Cache-Control', 'no-store')
  getCsrfToken(@Req() req: CsrfRequest) {
    return { csrfToken: req.csrfToken() };
  }

  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }
}
