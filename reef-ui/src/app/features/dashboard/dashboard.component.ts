import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { FinanceHubService } from '../../core/services/finance-hub.service';
import { AuthService } from '../../core/services/auth.service';
import { Account } from '../../core/models/account.models';
import { MonthlySummary } from '../../core/models/transaction.models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass, BaseChartDirective],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Good {{ greeting }}, {{ user?.firstName }}</h1>
          <p class="subtitle">{{ monthName }} financial overview</p>
        </div>
        <button class="btn-primary" routerLink="/accounts">+ New Account</button>
      </div>

      <!-- Summary stat cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon income-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div class="stat-body">
            <p class="stat-label">Total Income</p>
            <p class="stat-value income-val">{{ summary?.totalIncome | currency:'ZAR':'symbol':'1.2-2' }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon expense-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          </div>
          <div class="stat-body">
            <p class="stat-label">Total Expenses</p>
            <p class="stat-value expense-val">{{ summary?.totalExpenses | currency:'ZAR':'symbol':'1.2-2' }}</p>
          </div>
        </div>

        <div class="stat-card" [ngClass]="(summary?.netSavings ?? 0) >= 0 ? 'savings-card' : 'deficit-card'">
          <div class="stat-icon" [ngClass]="(summary?.netSavings ?? 0) >= 0 ? 'savings-icon' : 'deficit-icon'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div class="stat-body">
            <p class="stat-label">Net Savings</p>
            <p class="stat-value" [ngClass]="(summary?.netSavings ?? 0) >= 0 ? 'savings-val' : 'deficit-val'">
              {{ summary?.netSavings | currency:'ZAR':'symbol':'1.2-2' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main grid -->
      <div class="main-grid">
        <!-- Accounts -->
        <div class="card">
          <div class="card-header">
            <h2>My Accounts</h2>
            <a class="link-btn" routerLink="/accounts">Manage</a>
          </div>

          @for (account of accounts; track account.id) {
            <div class="account-row" [routerLink]="['/transactions', account.id]">
              <div class="account-avatar" [ngClass]="'avatar-' + account.accountType.toLowerCase()">
                {{ account.accountType[0] }}
              </div>
              <div class="account-info">
                <p class="account-name">{{ account.name }}</p>
                <p class="account-type">{{ account.accountType }} Account</p>
              </div>
              <div class="account-right">
                <p class="account-balance">{{ account.balance | currency:'ZAR':'symbol':'1.2-2' }}</p>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          }

          @if (!accounts.length) {
            <div class="empty-state">
              <p>No accounts yet.</p>
              <a routerLink="/accounts" class="link-btn">Create one</a>
            </div>
          }
        </div>

        <!-- Spend by category -->
        <div class="card">
          <div class="card-header">
            <h2>Spend by Category</h2>
          </div>
          @if (chartData.labels?.length) {
            <div class="chart-wrap">
              <canvas baseChart [data]="chartData" [options]="chartOptions" type="doughnut"></canvas>
            </div>
          } @else {
            <div class="empty-state">
              <p>No expense data for this month.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,.07);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .income-icon  { background: #DCFCE7; color: #16A34A; }
    .expense-icon { background: #FEE2E2; color: #EF4444; }
    .savings-icon { background: #DBEAFE; color: #2563EB; }
    .deficit-icon { background: #FEF3C7; color: #D97706; }

    .stat-label {
      margin: 0 0 4px;
      font-size: 12px;
      font-weight: 500;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    .stat-value {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -.3px;
    }
    .income-val  { color: #16A34A; }
    .expense-val { color: #EF4444; }
    .savings-val { color: #2563EB; }
    .deficit-val { color: #D97706; }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .account-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 13px 0;
      border-bottom: 1px solid #F1F5F9;
      cursor: pointer;
      transition: background .12s;
      border-radius: 8px;
      margin: 0 -8px;
      padding-left: 8px;
      padding-right: 8px;
    }
    .account-row:last-child { border-bottom: none; }
    .account-row:hover { background: #F8FAFC; }

    .account-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 700;
      flex-shrink: 0;
      color: #fff;
    }
    .avatar-cheque       { background: linear-gradient(135deg, #0B2D1A, #1A5C3A); }
    .avatar-savings      { background: linear-gradient(135deg, #065F46, #059669); }
    .avatar-fixeddeposit { background: linear-gradient(135deg, #4C1D95, #7C3AED); }

    .account-info { flex: 1; min-width: 0; }
    .account-name {
      margin: 0 0 2px;
      font-size: 14px;
      font-weight: 600;
      color: #0F172A;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .account-type { margin: 0; font-size: 12px; color: #94A3B8; }

    .account-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .account-balance {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      white-space: nowrap;
    }
    .chevron { color: #CBD5E1; }

    .chart-wrap { display: flex; justify-content: center; padding: 8px 0; }
    .chart-wrap canvas { max-height: 260px; }

    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .main-grid  { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  accounts: Account[]           = [];
  summary: MonthlySummary | null = null;
  greeting  = '';
  monthName = '';
  private hubSub?: Subscription;

  chartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { font: { family: 'Inter', size: 12 }, padding: 16 } }
    }
  };

  get user() { return this.authService.currentUser(); }

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private hubService: FinanceHubService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const hour = new Date().getHours();
    this.greeting  = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    this.monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    this.loadAccounts();
    this.loadSummary();

    this.hubSub = this.hubService.balanceUpdates$.subscribe(update => {
      const account = this.accounts.find(a => a.id === update.accountId);
      if (account) account.balance = update.newBalance;
    });
  }

  ngOnDestroy() { this.hubSub?.unsubscribe(); }

  private loadAccounts() {
    this.accountService.getAccounts().subscribe(accounts => { this.accounts = accounts; });
  }

  private loadSummary() {
    this.transactionService.getMonthlySummary().subscribe(summary => {
      this.summary = summary;
      this.chartData = {
        labels:   summary.spendByCategory.map(c => c.category),
        datasets: [{
          data:            summary.spendByCategory.map(c => c.amount),
          backgroundColor: ['#EF4444','#F97316','#EAB308','#22C55E','#06B6D4','#3B82F6','#8B5CF6','#EC4899','#14B8A6'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      };
    });
  }
}
