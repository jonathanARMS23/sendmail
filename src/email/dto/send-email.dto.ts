import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsNotEmpty()
  @IsEmail()
  from: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  lang: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  data?: Record<string, any>;
}
