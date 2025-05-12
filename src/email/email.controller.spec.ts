import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { TemplateResolverService } from './template-resolver.service';

describe('EmailController', () => {
  let controller: EmailController;

  const mockQueue = {
    add: jest.fn(),
    getJob: jest.fn(),
  };

  const mockTemplateResolver = {
    resolveTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
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

    controller = module.get<EmailController>(EmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
