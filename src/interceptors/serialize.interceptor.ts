import {
  NestInterceptor,
  UseInterceptors,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { plainToInstance } from 'class-transformer';
export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
export class SerializeInterceptor implements NestInterceptor {
  constructor(private typeDto: any) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // // Run something before the request is handled by the request handler
    // console.log('Im running before the handler : ' + context);

    return next.handle().pipe(
      map((data: any) => {
        // // Run something before the response is sent out
        // console.log('I am running before the response is sent out', data);

        return plainToInstance(this.typeDto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
