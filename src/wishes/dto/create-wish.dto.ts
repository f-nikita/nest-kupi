import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWishDto {
  @IsString({ message: 'Название подарка должно быть строкой' })
  @IsNotEmpty({ message: 'Название подарка не может быть пустым' })
  @Length(1, 250, {
    message: 'Название подарка должно быть от 1 до 250 символов',
  })
  name: string;

  @IsString({ message: 'Ссылка должна быть строкой' })
  @IsNotEmpty({ message: 'Ссылка не должна быть пустой' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    { message: 'Укажите корректную ссылку на интернет-магазин' },
  )
  link: string;

  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @IsNotEmpty({ message: 'Ссылка на изображение не может быть пустой' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    { message: 'Ссылка на изображение должна быть валидным URL-адресом' },
  )
  image: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Цена должна быть числом и иметь не более 2 знаков после запятой',
    },
  )
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  @Max(99999999.99, { message: 'Цена слишком велика' })
  @Type(() => Number) // Гарантирует преобразование входящего DTO-значения в тип Number
  price: number;

  @IsString({ message: 'Описание должно быть строкой' })
  @MinLength(1, { message: 'Описание не должно быть пустым' })
  @MaxLength(1024, { message: 'Максимальная длина описания — 1024 символа' })
  description: string;
}
