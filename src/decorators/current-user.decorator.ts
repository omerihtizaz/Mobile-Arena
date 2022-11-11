import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import cookieSession from 'cookie-session';
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return { userID: request.session.userID };
  },
);
