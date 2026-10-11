import { IsNotEmpty, IsString } from 'class-validator';

export class QueryPost {
  @IsString()
  @IsNotEmpty()
  query: string;
}
