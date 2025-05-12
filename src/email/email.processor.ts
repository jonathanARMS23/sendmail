import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  /**
   * Traite un job d'envoi d'email
   * @param job Le job à traiter
   */
  @Process('send')
  async handleSendEmail(job: Job) {
    try {
      this.logger.log(`Traitement du job d'envoi d'email ${job.id}`);
      const { to, from, subject, templateContent, data } = job.data;

      // simulation d'envoie de mail
      await this.simulateSendEmail({
        to,
        from,
        subject,
        templateContent,
        data,
      });

      this.logger.log(`Email envoyé avec succès: ${job.id}`);
      return { success: true, jobId: job.id };
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simule l'envoi d'un email
   */
  private async simulateSendEmail(params: any): Promise<void> {
    const { to, from, subject, templateContent, data } = params;
    // Remplacer les variables du template avec les données fournies
    let content = templateContent;
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        content = content.replace(regex, String(value));
      });
    }

    // Simuler le délai d'envoi d'un email (1-2 secondes)
    const delay = Math.floor(Math.random() * 1000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Journaliser les informations de l'email (simulation)
    this.logger.debug('----------------------------------------');
    this.logger.debug("SIMULATION D'ENVOI D'EMAIL");
    this.logger.debug(`De: ${from}`);
    this.logger.debug(`À: ${to}`);
    this.logger.debug(`Sujet: ${subject}`);
    this.logger.debug('Contenu:');
    this.logger.debug(content);
    this.logger.debug('----------------------------------------');

    // Simulation de 5% d'échecs aléatoires pour tester les réessais
    if (Math.random() < 0.05) {
      throw new Error("Échec aléatoire simulé de l'envoi d'email");
    }
  }
}
