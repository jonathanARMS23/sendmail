import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplateResolverService {
  private readonly logger = new Logger(TemplateResolverService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère le template d'email approprié en fonction des critères donnés
   *
   * @param type Type d'email (ex: 'otp', 'welcome')
   * @param lang Langue de l'email (ex: 'en', 'fr')
   * @param workspaceId ID du workspace (optionnel)
   * @returns L'identifiant du template d'email à utiliser et les informations du template
   */
  async resolveTemplate(type: string, lang: string, workspaceId?: string) {
    this.logger.debug(
      `Résolution du template: type=${type}, lang=${lang}, workspaceId=${workspaceId || 'null'}`,
    );

    try {
      // 1. Recherche d'une correspondance exacte (type + lang + workspaceId)
      if (workspaceId) {
        const exactMatch = await this.prisma.emailTemplateMapping.findFirst({
          where: {
            type,
            lang,
            workspaceId,
          },
          include: {
            template: true,
          },
        });

        if (exactMatch) {
          this.logger.debug(
            `Template trouvé avec correspondance exacte: ${exactMatch.templateId}`,
          );
          return exactMatch;
        }
      }

      // 2. Recherche par type + lang (sans workspace)
      const langMatch = await this.prisma.emailTemplateMapping.findFirst({
        where: {
          type,
          lang,
          workspaceId: null,
        },
        orderBy: {
          isDefault: 'desc', // Priorité aux templates par défaut
        },
        include: {
          template: true,
        },
      });

      if (langMatch) {
        this.logger.debug(
          `Template trouvé avec correspondance de langue: ${langMatch.templateId}`,
        );
        return langMatch;
      }

      // 3. Fallback sur le template par défaut pour ce type
      const defaultTemplate = await this.prisma.emailTemplateMapping.findFirst({
        where: {
          type,
          isDefault: true,
          workspaceId: null,
        },
        include: {
          template: true,
        },
      });

      if (defaultTemplate) {
        this.logger.debug(
          `Template par défaut utilisé: ${defaultTemplate.templateId}`,
        );
        return defaultTemplate;
      }

      // 4. Si aucun template n'est trouvé, on lance une erreur
      throw new NotFoundException(
        `Aucun template trouvé pour type: ${type}, langue: ${lang}`,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la résolution du template: ${error.message}`,
      );
      throw error;
    }
  }
}
