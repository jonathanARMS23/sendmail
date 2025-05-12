import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailProcessor],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
    loggerSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleSendEmail', () => {
    const mockJobData = {
      to: 'test@example.com',
      from: 'noreply@example.com',
      subject: 'Test Email',
      templateContent: '<h1>Hello {{name}}</h1>',
      data: { name: 'John' },
    };

    const mockJob = {
      id: 'job-123',
      data: mockJobData,
    } as Job;

    it('should successfully process an email job', async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.1); // Pour éviter l'échec aléatoire

      const result = await processor.handleSendEmail(mockJob);

      expect(result).toEqual({
        success: true,
        jobId: 'job-123',
      });
    });

    it('should throw an error when random failure occurs', async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.01); // Pour déclencher l'échec aléatoire

      await expect(processor.handleSendEmail(mockJob)).rejects.toThrow(
        "Échec aléatoire simulé de l'envoi d'email",
      );
    });

    it('should replace template variables with data', async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.1);

      await processor.handleSendEmail(mockJob);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('<h1>Hello John</h1>'),
      );
    });
  });
});
