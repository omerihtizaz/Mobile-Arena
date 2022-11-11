import { ExecutionContext, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('in auth guard: ', request.session);
    return request.session.userID;
  }
}
