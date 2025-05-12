import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto } from './dto/send-email.dto';
import { TemplateResolverService } from './template-resolver.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    private readonly templateResolver: TemplateResolverService,
  ) {}

  /**
   * Envoie un email en utilisant le template approprié
   * @param emailDto Les données pour l'envoi de l'email
   * @returns Un objet contenant l'ID du job et les information du template utilisé
   */
  async sendEmail(emailDto: SendEmailDto) {
    try {
      // Résoudre le template approprié
      const templateMapping = await this.templateResolver.resolveTemplate(
        emailDto.type,
        emailDto.lang,
        emailDto.workspaceId,
      );

      // Préparer les données pour le job
      const jobData = {
        ...emailDto,
        templateId: templateMapping.templateId,
        templateContent: templateMapping.template.htmlContent,
      };

      // Ajouter le job à la queue
      const job = await this.emailQueue.add('send', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      });

      this.logger.log(`Email ajouté à la queue avec l'ID de job: ${job.id}`);

      return {
        jobId: job.id,
        template: templateMapping,
        status: 'queued',
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'ajout de l'email à la queue: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Récupère l'état d'un job d'envoi d'email
   * @param jobId L'ID du job
   * @returns L'état du job
   */
  async getEmailStatus(jobId: string | number) {
    const job = await this.emailQueue.getJob(jobId);

    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    return { status: state };
  }
}
