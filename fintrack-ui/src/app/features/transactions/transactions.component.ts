import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/models/account.models';
import { Transaction } from '../../core/models/transaction.models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatTabsModule, MatFormFieldModule,
            MatInputModule, MatSelectModule, MatButtonModule, MatChipsModule,
            RouterLink, CurrencyPipe, DatePipe, NgClass],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>{{ account?.name }}</h1>
          <p class="balance">{{ account?.balance | currency:'ZAR':'symbol':'1.2-2' }}</p>
        </div>
        <a mat-button routerLink="/dashboard">← Dashboard</a>
      </div>

      <div class="layout">
        <!-- Transaction list -->
        <mat-card>
          <mat-card-header><mat-card-title>History</mat-card-title></mat-card-header>
          <mat-card-content>
            @for (tx of transactions; track tx.id) {
              <div class="tx-row">
                <div>
                  <p class="tx-desc">{{ tx.description }}</p>
                  <p class="tx-meta">{{ tx.category }} · {{ tx.transactionDate | date:'d MMM yyyy' }}</p>
                </div>
                <div class="tx-right">
                  <p class="tx-amount" [ngClass]="tx.type === 'Income' || tx.type === 'TransferCredit' ? 'credit' : 'debit'">
                    {{ tx.type === 'Income' || tx.type === 'TransferCredit' ? '+' : '-' }}{{ tx.amount | currency:'ZAR':'symbol':'1.2-2' }}
                  </p>
                  <p class="tx-balance">bal: {{ tx.balanceAfter | currency:'ZAR':'symbol':'1.2-2' }}</p>
                </div>
              </div>
            }
            @if (!transactions.length) {
              <p class="empty">No transactions yet.</p>
            }
          </mat-card-content>
        </mat-card>

        <!-- Action tabs -->
        <mat-card>
          <mat-card-content>
            <mat-tab-group>
              <mat-tab label="Deposit">
                <form [formGroup]="depositForm" (ngSubmit)="deposit()" class="form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Amount (ZAR)</mat-label>
                    <input matInput type="number" formControlName="amount" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Category</mat-label>
                    <mat-select formControlName="categoryId">
                      <mat-option [value]="1">Salary</mat-option>
                      <mat-option [value]="2">Freelance</mat-option>
                      <mat-option [value]="3">Investment</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <input matInput formControlName="description" />
                  </mat-form-field>
                  <button mat-flat-button color="primary" class="full-width" type="submit" [disabled]="depositForm.invalid || saving">
                    {{ saving ? 'Processing...' : 'Deposit' }}
                  </button>
                </form>
              </mat-tab>

              <mat-tab label="Withdraw">
                <form [formGroup]="withdrawForm" (ngSubmit)="withdraw()" class="form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Amount (ZAR)</mat-label>
                    <input matInput type="number" formControlName="amount" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Category</mat-label>
                    <mat-select formControlName="categoryId">
                      <mat-option [value]="4">Groceries</mat-option>
                      <mat-option [value]="5">Transport</mat-option>
                      <mat-option [value]="6">Rent</mat-option>
                      <mat-option [value]="7">Utilities</mat-option>
                      <mat-option [value]="8">Entertainment</mat-option>
                      <mat-option [value]="12">Other</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <input matInput formControlName="description" />
                  </mat-form-field>
                  <button mat-flat-button color="warn" class="full-width" type="submit" [disabled]="withdrawForm.invalid || saving">
                    {{ saving ? 'Processing...' : 'Withdraw' }}
                  </button>
                </form>
              </mat-tab>
            </mat-tab-group>

            @if (error) { <p class="error">{{ error }}</p> }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .balance { font-size: 20px; font-weight: 600; margin: 4px 0 0; color: #1976d2; }
    .layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
    .tx-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .tx-desc { margin: 0; font-weight: 500; }
    .tx-meta { margin: 2px 0 0; font-size: 12px; color: #888; }
    .tx-right { text-align: right; }
    .tx-amount { margin: 0; font-weight: 600; }
    .tx-amount.credit { color: #4caf50; }
    .tx-amount.debit  { color: #f44336; }
    .tx-balance { margin: 2px 0 0; font-size: 12px; color: #888; }
    .form { padding: 16px 0; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .error { color: #f44336; margin-top: 8px; }
    .empty { color: #999; text-align: center; padding: 32px; }
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
