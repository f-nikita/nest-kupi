import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(999999)
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemId: number;
}
