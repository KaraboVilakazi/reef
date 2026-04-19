import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Budget, SetBudgetRequest } from '../models/budget.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly baseUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  getBudgets(month?: number, year?: number) {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year)  params = params.set('year', year);
    return this.http.get<{ data: Budget[] }>(this.baseUrl, { params }).pipe(map(r => r.data));
  }

  setBudget(request: SetBudgetRequest) {
    return this.http.post<{ data: Budget }>(this.baseUrl, request).pipe(map(r => r.data));
  }
}
