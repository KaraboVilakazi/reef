import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
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
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDividerModule,
            RouterLink, CurrencyPipe, NgClass, BaseChartDirective],
  template: `
    <div class="dashboard">
      <div class="header">
        <div>
          <h1>Good {{ greeting }}, {{ user?.firstName }} 👋</h1>
          <p class="subtitle">Here's your financial overview for {{ monthName }}</p>
        </div>
        <button mat-flat-button color="primary" routerLink="/accounts">+ New Account</button>
      </div>

      <!-- Summary cards -->
      <div class="summary-cards">
        <mat-card class="summary-card income">
          <mat-card-content>
            <p class="label">Total Income</p>
            <p class="amount">{{ summary?.totalIncome | currency:'ZAR':'symbol':'1.2-2' }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card expenses">
          <mat-card-content>
            <p class="label">Total Expenses</p>
            <p class="amount">{{ summary?.totalExpenses | currency:'ZAR':'symbol':'1.2-2' }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card" [ngClass]="(summary?.netSavings ?? 0) >= 0 ? 'savings' : 'deficit'">
          <mat-card-content>
            <p class="label">Net Savings</p>
            <p class="amount">{{ summary?.netSavings | currency:'ZAR':'symbol':'1.2-2' }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="main-grid">
        <!-- Accounts -->
        <mat-card class="accounts-card">
          <mat-card-header>
            <mat-card-title>Accounts</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (account of accounts; track account.id) {
              <div class="account-row" [routerLink]="['/transactions', account.id]">
                <div>
                  <p class="account-name">{{ account.name }}</p>
                  <p class="account-type">{{ account.accountType }}</p>
                </div>
                <p class="account-balance">{{ account.balance | currency:'ZAR':'symbol':'1.2-2' }}</p>
              </div>
              <mat-divider />
            }
            @if (!accounts.length) {
              <p class="empty-state">No accounts yet. <a routerLink="/accounts">Create one</a></p>
            }
          </mat-card-content>
        </mat-card>

        <!-- Spend by category chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Spend by Category</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (chartData.labels?.length) {
              <canvas baseChart [data]="chartData" [options]="chartOptions" type="doughnut"></canvas>
            } @else {
              <p class="empty-state">No expense data for this month.</p>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 24px; }
    .subtitle { margin: 4px 0 0; color: #666; }
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card.income  { border-top: 4px solid #4caf50; }
    .summary-card.expenses { border-top: 4px solid #f44336; }
    .summary-card.savings { border-top: 4px solid #2196f3; }
    .summary-card.deficit { border-top: 4px solid #ff9800; }
    .label  { margin: 0; font-size: 13px; color: #666; }
    .amount { margin: 8px 0 0; font-size: 22px; font-weight: 600; }
    .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .account-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; cursor: pointer; }
    .account-row:hover { background: #f9f9f9; }
    .account-name { margin: 0; font-weight: 500; }
    .account-type { margin: 2px 0 0; font-size: 12px; color: #888; }
    .account-balance { margin: 0; font-weight: 600; }
    .empty-state { color: #999; text-align: center; padding: 24px 0; }
    canvas { max-height: 280px; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  accounts: Account[]      = [];
  summary: MonthlySummary | null = null;
  greeting = '';
  monthName = '';
  private hubSub?: Subscription;

  chartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { position: 'right' } }
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

    // Subscribe to real-time balance updates from SignalR
    // When a transaction posts, the balance on the dashboard updates instantly
    this.hubSub = this.hubService.balanceUpdates$.subscribe(update => {
      const account = this.accounts.find(a => a.id === update.accountId);
      if (account) account.balance = update.newBalance;
    });
  }

  ngOnDestroy() {
    this.hubSub?.unsubscribe();
  }

  private loadAccounts() {
    this.accountService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
    });
  }

  private loadSummary() {
    this.transactionService.getMonthlySummary().subscribe(summary => {
      this.summary = summary;
      this.chartData = {
        labels:   summary.spendByCategory.map(c => c.category),
        datasets: [{
          data:            summary.spendByCategory.map(c => c.amount),
          backgroundColor: ['#f44336','#e91e63','#9c27b0','#3f51b5','#2196f3','#00bcd4','#4caf50','#ff9800','#795548']
        }]
      };
    });
  }
}
