import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/models/account.models';
import { Transaction } from '../../core/models/transaction.models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, NgClass],
  template: `
    <div class="page">
      <!-- Account hero header -->
      <div class="account-hero" [ngClass]="'hero-' + (account?.accountType?.toLowerCase() ?? 'cheque')">
        <div class="hero-inner">
          <a class="hero-back" routerLink="/dashboard">← Dashboard</a>
          <div class="hero-type">{{ account?.accountType }} Account</div>
          <h1 class="hero-name">{{ account?.name }}</h1>
          <div class="hero-balance-label">Available Balance</div>
          <div class="hero-balance">{{ account?.balance | currency:'ZAR':'symbol':'1.2-2' }}</div>
        </div>
      </div>

      <div class="layout">
        <!-- Transaction history -->
        <div class="card">
          <div class="card-header">
            <h2>Transaction History</h2>
            @if (transactions.length) {
              <span class="tx-count">{{ transactions.length }} transactions</span>
            }
          </div>

          @for (tx of transactions; track tx.id) {
            <div class="tx-row">
              <div class="tx-icon" [ngClass]="isCredit(tx) ? 'tx-icon-credit' : 'tx-icon-debit'">
                @if (isCredit(tx)) {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                } @else {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                }
              </div>
              <div class="tx-info">
                <p class="tx-desc">{{ tx.description }}</p>
                <p class="tx-meta">
                  <span class="tx-cat">{{ tx.category }}</span>
                  <span class="tx-dot">·</span>
                  <span>{{ tx.transactionDate | date:'d MMM yyyy' }}</span>
                </p>
              </div>
              <div class="tx-right">
                <p class="tx-amount" [ngClass]="isCredit(tx) ? 'credit' : 'debit'">
                  {{ isCredit(tx) ? '+' : '-' }}{{ tx.amount | currency:'ZAR':'symbol':'1.2-2' }}
                </p>
                <p class="tx-balance">bal {{ tx.balanceAfter | currency:'ZAR':'symbol':'1.0-0' }}</p>
              </div>
            </div>
          }

          @if (!transactions.length) {
            <div class="empty-state">
              <p>No transactions yet. Make your first deposit.</p>
            </div>
          }
        </div>

        <!-- Action panel -->
        <div class="action-panel">
          <!-- Deposit -->
          <div class="card action-card">
            <div class="card-header">
              <h2>Deposit</h2>
              <span class="action-badge deposit-badge">+ Credit</span>
            </div>
            <form [formGroup]="depositForm" (ngSubmit)="deposit()">
              <div class="field">
                <label>Amount (ZAR)</label>
                <input type="number" formControlName="amount" placeholder="0.00" />
              </div>
              <div class="field">
                <label>Category</label>
                <div class="select-wrap">
                  <select formControlName="categoryId">
                    <option [value]="1">Salary</option>
                    <option [value]="2">Freelance</option>
                    <option [value]="3">Investment Return</option>
                  </select>
                  <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div class="field">
                <label>Description</label>
                <input formControlName="description" placeholder="e.g. Monthly salary" />
              </div>
              <button type="submit" class="btn-deposit full-width" [disabled]="depositForm.invalid || saving">
                {{ saving ? 'Processing...' : 'Deposit Funds' }}
              </button>
            </form>
          </div>

          <!-- Withdraw -->
          <div class="card action-card">
            <div class="card-header">
              <h2>Withdraw</h2>
              <span class="action-badge withdraw-badge">- Debit</span>
            </div>
            <form [formGroup]="withdrawForm" (ngSubmit)="withdraw()">
              <div class="field">
                <label>Amount (ZAR)</label>
                <input type="number" formControlName="amount" placeholder="0.00" />
              </div>
              <div class="field">
                <label>Category</label>
                <div class="select-wrap">
                  <select formControlName="categoryId">
                    <option [value]="4">Groceries</option>
                    <option [value]="5">Transport / Petrol</option>
                    <option [value]="6">Rent</option>
                    <option [value]="7">Utilities</option>
                    <option [value]="8">Entertainment</option>
                    <option [value]="9">Healthcare</option>
                    <option [value]="10">Education / School Fees</option>
                    <option [value]="11">Clothing</option>
                    <option [value]="12">Airtime / Data</option>
                    <option [value]="12">Other</option>
                  </select>
                  <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div class="field">
                <label>Description</label>
                <input formControlName="description" placeholder="e.g. Checkers groceries" />
              </div>
              <button type="submit" class="btn-withdraw full-width" [disabled]="withdrawForm.invalid || saving">
                {{ saving ? 'Processing...' : 'Withdraw Funds' }}
              </button>
            </form>
          </div>

          @if (error) {
            <div class="error-banner">{{ error }}</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Hero header */
    .account-hero {
      color: #fff;
      padding: 32px 24px;
      margin-bottom: 0;
    }
    .hero-cheque       { background: linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%); }
    .hero-savings      { background: linear-gradient(135deg, #064E3B 0%, #059669 100%); }
    .hero-fixeddeposit { background: linear-gradient(135deg, #3B0764 0%, #7C3AED 100%); }

    .hero-inner {
      max-width: 1200px;
      margin: 0 auto;
    }
    .hero-back {
      display: inline-block;
      font-size: 13px;
      color: rgba(255,255,255,.6);
      margin-bottom: 20px;
      transition: color .15s;
    }
    .hero-back:hover { color: #fff; }
    .hero-type {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .8px;
      opacity: .6;
      margin-bottom: 4px;
    }
    .hero-name {
      margin: 0 0 20px;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -.3px;
    }
    .hero-balance-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .6px;
      opacity: .6;
      margin-bottom: 4px;
    }
    .hero-balance {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -.5px;
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Transaction rows */
    .tx-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 0;
      border-bottom: 1px solid #F1F5F9;
    }
    .tx-row:last-child { border-bottom: none; }

    .tx-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tx-icon-credit { background: #DCFCE7; color: #16A34A; }
    .tx-icon-debit  { background: #FEE2E2; color: #EF4444; }

    .tx-info { flex: 1; min-width: 0; }
    .tx-desc {
      margin: 0 0 3px;
      font-size: 14px;
      font-weight: 500;
      color: #0F172A;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tx-meta { margin: 0; font-size: 12px; color: #94A3B8; display: flex; gap: 6px; }
    .tx-cat { color: #64748B; }
    .tx-dot { color: #CBD5E1; }

    .tx-right { text-align: right; flex-shrink: 0; }
    .tx-amount {
      margin: 0 0 2px;
      font-size: 14px;
      font-weight: 700;
    }
    .tx-amount.credit { color: #16A34A; }
    .tx-amount.debit  { color: #EF4444; }
    .tx-balance { margin: 0; font-size: 11px; color: #94A3B8; }

    .tx-count { font-size: 12px; color: #94A3B8; }

    /* Action panel */
    .action-panel { display: flex; flex-direction: column; gap: 16px; }
    .action-card { position: sticky; top: 80px; }

    .action-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
    }
    .deposit-badge  { background: #DCFCE7; color: #16A34A; }
    .withdraw-badge { background: #FEE2E2; color: #EF4444; }

    .field { margin-bottom: 14px; }
    .field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    .field input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: #0F172A;
      background: #fff;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
      box-sizing: border-box;
    }
    .field input:focus {
      border-color: #00C896;
      box-shadow: 0 0 0 3px rgba(0,200,150,.12);
    }
    .field input::placeholder { color: #CBD5E1; }

    .select-wrap { position: relative; }
    .select-wrap select {
      width: 100%;
      padding: 10px 32px 10px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: #0F172A;
      background: #fff;
      outline: none;
      appearance: none;
      cursor: pointer;
      transition: border-color .15s;
    }
    .select-wrap select:focus {
      border-color: #00C896;
      box-shadow: 0 0 0 3px rgba(0,200,150,.12);
    }
    .select-arrow {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }

    .full-width { width: 100%; }

    .btn-deposit, .btn-withdraw {
      padding: 11px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      margin-top: 4px;
      transition: background .15s;
    }
    .btn-deposit { background: #00C896; color: #0D1B2A; }
    .btn-deposit:hover:not(:disabled) { background: #00A87E; }
    .btn-withdraw { background: #EF4444; color: #fff; }
    .btn-withdraw:hover:not(:disabled) { background: #DC2626; }
    .btn-deposit:disabled, .btn-withdraw:disabled { opacity: .55; cursor: not-allowed; }

    .error-banner {
      background: #FEE2E2;
      color: #B91C1C;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
    }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; padding: 16px; }
      .action-card { position: static; }
    }
  `]
})
export class TransactionsComponent implements OnInit {
  account: Account | null = null;
  transactions: Transaction[] = [];
  depositForm: FormGroup;
  withdrawForm: FormGroup;
  saving = false;
  error  = '';

  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private fb: FormBuilder
  ) {
    this.depositForm = this.fb.group({
      amount:      [null, [Validators.required, Validators.min(0.01)]],
      categoryId:  [1, Validators.required],
      description: ['', Validators.required]
    });
    this.withdrawForm = this.fb.group({
      amount:      [null, [Validators.required, Validators.min(0.01)]],
      categoryId:  [4, Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    const accountId = this.route.snapshot.paramMap.get('accountId')!;
    this.accountService.getAccount(accountId).subscribe(a => this.account = a);
    this.loadTransactions(accountId);
  }

  isCredit(tx: Transaction): boolean {
    return tx.type === 'Income' || tx.type === 'TransferCredit';
  }

  private loadTransactions(accountId: string) {
    this.transactionService.getTransactions(accountId).subscribe(t => this.transactions = t);
  }

  deposit() {
    if (this.depositForm.invalid || !this.account) return;
    this.saving = true;
    this.transactionService.deposit({ accountId: this.account.id, ...this.depositForm.value }).subscribe({
      next: tx => {
        this.transactions.unshift(tx);
        this.account!.balance = tx.balanceAfter;
        this.depositForm.reset({ categoryId: 1 });
        this.saving = false;
      },
      error: err => { this.error = err.error?.message ?? 'Failed.'; this.saving = false; }
    });
  }

  withdraw() {
    if (this.withdrawForm.invalid || !this.account) return;
    this.saving = true;
    this.transactionService.withdraw({ accountId: this.account.id, ...this.withdrawForm.value }).subscribe({
      next: tx => {
        this.transactions.unshift(tx);
        this.account!.balance = tx.balanceAfter;
        this.withdrawForm.reset({ categoryId: 4 });
        this.saving = false;
      },
      error: err => { this.error = err.error?.message ?? 'Failed.'; this.saving = false; }
    });
  }
}
