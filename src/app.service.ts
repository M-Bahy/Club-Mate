import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  myName(): string {
    return ' <h1>My name is Bahy</h1> ';
  }
}
