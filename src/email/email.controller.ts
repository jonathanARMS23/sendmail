import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Endpoint pour envoyer un email
   * @param sendEmailDto Données à renseigner dans le body
   * @returns Informations sur le job créé
   */
  @Post('send')
  async sendEmail(@Body(ValidationPipe) sendEmailDto: SendEmailDto) {
    return this.emailService.sendEmail(sendEmailDto);
  }

  /**
   * Endpoint pour vérifier l'état d'un job d'envoi d'email
   * @param jobId L'ID du job
   * @returns L'état du job
   */
  @Get('status/:jobId')
  async getEmailStatus(@Param('jobId') jobId: string) {
    return this.emailService.getEmailStatus(jobId);
  }
}
