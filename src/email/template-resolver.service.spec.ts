import { Test, TestingModule } from '@nestjs/testing';
import { TemplateResolverService } from './template-resolver.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TemplateResolverService', () => {
  let service: TemplateResolverService;

  const mockPrismaService = {
    emailTemplateMapping: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateResolverService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TemplateResolverService>(TemplateResolverService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveTemplate', () => {
    const mockTemplate = {
      id: 'template-123',
      htmlContent: '<h1>Hello</h1>',
    };

    const mockTemplateMapping = {
      templateId: 'template-123',
      template: mockTemplate,
    };

    it('should find exact match with workspaceId', async () => {
      mockPrismaService.emailTemplateMapping.findFirst.mockResolvedValueOnce(
        mockTemplateMapping,
      );

      const result = await service.resolveTemplate(
        'welcome',
        'fr',
        'workspace-123',
      );

      expect(result).toEqual(mockTemplateMapping);
      expect(
        mockPrismaService.emailTemplateMapping.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          type: 'welcome',
          lang: 'fr',
          workspaceId: 'workspace-123',
        },
        include: {
          template: true,
        },
      });
    });

    it('should find match by type and lang when no workspace match', async () => {
      mockPrismaService.emailTemplateMapping.findFirst
        .mockResolvedValueOnce(null) // Première recherche (avec workspace)
        .mockResolvedValueOnce(mockTemplateMapping); // Deuxième recherche (sans workspace)

      const result = await service.resolveTemplate(
        'welcome',
        'fr',
        'workspace-123',
      );

      expect(result).toEqual(mockTemplateMapping);
      expect(
        mockPrismaService.emailTemplateMapping.findFirst,
      ).toHaveBeenCalledTimes(2);
    });

    it('should find default template when no specific match', async () => {
      mockPrismaService.emailTemplateMapping.findFirst
        .mockResolvedValueOnce(null) // Première recherche (avec workspace)
        .mockResolvedValueOnce(null) // Deuxième recherche (sans workspace)
        .mockResolvedValueOnce(mockTemplateMapping); // Troisième recherche (template par défaut)

      const result = await service.resolveTemplate(
        'welcome',
        'fr',
        'workspace-123',
      );

      expect(result).toEqual(mockTemplateMapping);
      expect(
        mockPrismaService.emailTemplateMapping.findFirst,
      ).toHaveBeenCalledTimes(3);
    });

    it('should throw NotFoundException when no template is found', async () => {
      mockPrismaService.emailTemplateMapping.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(
        service.resolveTemplate('welcome', 'fr', 'workspace-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prioritize default templates when searching by type and lang', async () => {
      mockPrismaService.emailTemplateMapping.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockTemplateMapping);

      await service.resolveTemplate('welcome', 'fr', 'workspace-123');

      expect(
        mockPrismaService.emailTemplateMapping.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          type: 'welcome',
          lang: 'fr',
          workspaceId: null,
        },
        orderBy: {
          isDefault: 'desc',
        },
        include: {
          template: true,
        },
      });
    });
  });
});
