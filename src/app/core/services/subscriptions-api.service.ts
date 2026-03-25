import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';
import { Subscription } from '../models/subscription.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionsApiService {
  private readonly http = inject(HttpClient);

  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(
      `${API_BASE_URL}/${API_ENDPOINTS.subscriptions}`,
    );
  }

  createSubscription(
    subscription: Omit<Subscription, 'id'>,
  ): Observable<Subscription> {
    return this.http.post<Subscription>(
      `${API_BASE_URL}/${API_ENDPOINTS.subscriptions}`,
      subscription,
    );
  }

  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.http.put<Subscription>(
      `${API_BASE_URL}/${API_ENDPOINTS.subscriptions}/${subscription.id}`,
      subscription,
    );
  }
}