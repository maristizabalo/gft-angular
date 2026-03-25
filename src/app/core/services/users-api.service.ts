import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';
import { INITIAL_USER_ID } from '../constants/business.constants';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly http = inject(HttpClient);

  getUser(): Observable<User> {
    return this.http.get<User>(
      `${API_BASE_URL}/${API_ENDPOINTS.users}/${INITIAL_USER_ID}`,
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(
      `${API_BASE_URL}/${API_ENDPOINTS.users}/${user.id}`,
      user,
    );
  }
}