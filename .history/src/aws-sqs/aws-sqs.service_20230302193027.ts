import { Injectable } from '@nestjs/common';
import { Squiss, Message } from 'squiss-ts';

@Injectable()
export class AwsSqsService {

  private readonly squiss: Squiss;

  constructor() {
    const awsConfig = {
      accessKeyId: '<accessKeyId>',
      secretAccessKey: '<secretAccessKey>',
      region: '<region>',
    };

    this.squiss = new Squiss({
      awsConfig,
      queueName: 'my-sqs-queue',
      bodyFormat: 'json',
      maxInFlight: 15
    });
  }

}
