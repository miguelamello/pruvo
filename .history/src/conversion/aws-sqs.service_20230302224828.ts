import { Injectable } from '@nestjs/common';
import { Squiss, Message } from 'squiss-ts';
import { Subject, Observable } from 'rxjs';
import { queryParams } from '../interfaces/queryParam.interface';

@Injectable()
export class AwsSqsService {

  private readonly squiss: Squiss;
  private readonly message$ = new Subject<Message>();

  constructor() {

    const awsConfig = {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
      region: 'dummy',
      endpoint: 'http://localhost:9324'
    };

    this.squiss = new Squiss({
      awsConfig,
      queueName: 'awssqs-queue',
      bodyFormat: 'json',
      maxInFlight: 15
    });

    this.start();

  }

  // Sets an observable to receive messages from the queue
  getMessage$(): Observable<Message> {
    return this.message$.asObservable();
  }

  // 
  onMessage(message: Message): void {
    this.message$.next(message);
    message.del();
  }

  startListening(): void {
    this.squiss.on('message', this.onMessage.bind(this));
    this.squiss.start();
  }

  async start(): Promise<void> {
    this.startListening();
  }

  async sendMessage( message: queryParams ): Promise<void> {
    const messageToSend = message;
    const propsToSend = {};

    await this.squiss.sendMessage(messageToSend, 0, propsToSend);

  }

}
