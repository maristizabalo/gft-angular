import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';
import { Fund } from '../models/fund.model';

@Injectable({
  providedIn: 'root',
})
export class FundsApiService {
  private readonly http = inject(HttpClient);

  getFunds(): Observable<Fund[]> {
    return this.http.get<Fund[]>(`${API_BASE_URL}/${API_ENDPOINTS.funds}`);
  }
}