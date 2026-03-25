import { HttpInterceptorFn } from '@angular/common/http';
import { delay } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

export const apiDelayInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_BASE_URL)) {
    return next(request);
  }

  return next(request).pipe(delay(350));
};