import { Test, TestingModule } from '@nestjs/testing';
import { AwsSqsService } from './aws-sqs.service';

try {
  
} catch (error) {
  console.log(error);
}
describe('AwsSqsService', () => {
  let service: AwsSqsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsSqsService],
    }).compile();

    service = module.get<AwsSqsService>(AwsSqsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
