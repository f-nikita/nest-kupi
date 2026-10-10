import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

const jwtOptions: JwtModuleOptions = {
  secret: process.env.JWT_SECRET ?? 'some-key',
  signOptions: {
    expiresIn: '7d',
  },
};

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register(jwtOptions)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
