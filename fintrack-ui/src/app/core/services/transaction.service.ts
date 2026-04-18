import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
  DepositRequest, MonthlySummary, Transaction,
  TransferRequest, WithdrawRequest
} from '../models/transaction.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly baseUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  deposit(request: DepositRequest) {
    return this.http.post<{ data: Transaction }>(`${this.baseUrl}/deposit`, request).pipe(map(r => r.data));
  }

  withdraw(request: WithdrawRequest) {
    return this.http.post<{ data: Transaction }>(`${this.baseUrl}/withdraw`, request).pipe(map(r => r.data));
  }

  transfer(request: TransferRequest) {
    return this.http.post<{ data: Transaction }>(`${this.baseUrl}/transfer`, request).pipe(map(r => r.data));
  }

  getTransactions(accountId: string, page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<{ data: Transaction[] }>(`${this.baseUrl}/account/${accountId}`, { params })
      .pipe(map(r => r.data));
  }

  getMonthlySummary(month?: number, year?: number) {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year)  params = params.set('year', year);
    return this.http
      .get<{ data: MonthlySummary }>(`${this.baseUrl}/summary`, { params })
      .pipe(map(r => r.data));
  }
}
