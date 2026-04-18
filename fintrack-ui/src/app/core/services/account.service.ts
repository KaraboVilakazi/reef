import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Account, CreateAccountRequest } from '../models/account.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly baseUrl = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getAccounts() {
    return this.http.get<{ data: Account[] }>(this.baseUrl).pipe(map(r => r.data));
  }

  getAccount(id: string) {
    return this.http.get<{ data: Account }>(`${this.baseUrl}/${id}`).pipe(map(r => r.data));
  }

  createAccount(request: CreateAccountRequest) {
    return this.http.post<{ data: Account }>(this.baseUrl, request).pipe(map(r => r.data));
  }
}
