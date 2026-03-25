import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionsApiService {
  private readonly http = inject(HttpClient);

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `${API_BASE_URL}/${API_ENDPOINTS.transactions}`,
    );
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${API_BASE_URL}/${API_ENDPOINTS.transactions}`,
      transaction,
    );
  }
}