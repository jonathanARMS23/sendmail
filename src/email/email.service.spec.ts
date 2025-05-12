import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
// import { Queue } from 'bull';
import { TemplateResolverService } from './template-resolver.service';
import { SendEmailDto } from './dto/send-email.dto';

describe('EmailService', () => {
  let service: EmailService;
  // let emailQueue: Queue;
  // let templateResolver: TemplateResolverService;

  const mockQueue = {
    add: jest.fn(),
    getJob: jest.fn(),
  };

  const mockTemplateResolver = {
    resolveTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: 'BullQueue_email',
          useValue: mockQueue,
        },
        {
          provide: TemplateResolverService,
          useValue: mockTemplateResolver,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    // emailQueue = module.get<Queue>('BullQueue_email');
    /* templateResolver = module.get<TemplateResolverService>(
      TemplateResolverService,
    ); */
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    const mockEmailDto: SendEmailDto = {
      to: 'test@example.com',
      from: 'noreply@example.com',
      subject: 'Test Email',
      type: 'welcome',
      lang: 'fr',
      workspaceId: '123',
      data: { name: 'John' },
    };

    const mockTemplateMapping = {
      templateId: 'template-123',
      template: {
        htmlContent: '<h1>Hello {{name}}</h1>',
      },
    };

    it('should successfully queue an email', async () => {
      mockTemplateResolver.resolveTemplate.mockResolvedValue(
        mockTemplateMapping,
      );
      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      const result = await service.sendEmail(mockEmailDto);

      expect(result).toEqual({
        jobId: 'job-123',
        template: mockTemplateMapping,
        status: 'queued',
      });
      expect(mockTemplateResolver.resolveTemplate).toHaveBeenCalledWith(
        mockEmailDto.type,
        mockEmailDto.lang,
        mockEmailDto.workspaceId,
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send',
        {
          ...mockEmailDto,
          templateId: mockTemplateMapping.templateId,
          templateContent: mockTemplateMapping.template.htmlContent,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
        },
      );
    });

    it('should throw an error when template resolution fails', async () => {
      const error = new Error('Template not found');
      mockTemplateResolver.resolveTemplate.mockRejectedValue(error);

      await expect(service.sendEmail(mockEmailDto)).rejects.toThrow(error);
    });
  });

  describe('getEmailStatus', () => {
    it('should return job status when job exists', async () => {
      const mockJob = {
        getState: jest.fn().mockResolvedValue('completed'),
      };
      mockQueue.getJob.mockResolvedValue(mockJob);

      const result = await service.getEmailStatus('job-123');

      expect(result).toEqual({ status: 'completed' });
      expect(mockQueue.getJob).toHaveBeenCalledWith('job-123');
    });

    it('should return not_found when job does not exist', async () => {
      mockQueue.getJob.mockResolvedValue(null);

      const result = await service.getEmailStatus('non-existent-job');

      expect(result).toEqual({ status: 'not_found' });
    });
  });
});
