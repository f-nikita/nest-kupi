import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateNested,
} from 'class-validator';
import { Wish } from 'src/wishes/entities/wish.entity';

export class CreateWishlistDto {
  @IsNotEmpty({ message: 'Название списка не может быть пустым' })
  @IsString({ message: 'Название должно быть строкой' })
  @Length(1, 250, {
    message: 'Название списка должно быть от 1 до 250 символов',
  })
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 1500)
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Обложка должна быть валидной ссылкой URL' })
  image?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Wish)
  items?: Wish[];
}
