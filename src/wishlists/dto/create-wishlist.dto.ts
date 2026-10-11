import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

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

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  items?: number[];
}
