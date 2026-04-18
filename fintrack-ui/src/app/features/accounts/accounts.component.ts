import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/models/account.models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
            MatSelectModule, MatButtonModule, MatIconModule, RouterLink, CurrencyPipe],
  template: `
    <div class="page">
      <div class="header">
        <h1>Accounts</h1>
        <a mat-button routerLink="/dashboard">← Dashboard</a>
      </div>

      <div class="layout">
        <!-- Account list -->
        <div class="account-list">
          @for (account of accounts; track account.id) {
            <mat-card class="account-card">
              <mat-card-content>
                <div class="account-header">
                  <div>
                    <h3>{{ account.name }}</h3>
                    <span class="chip">{{ account.accountType }}</span>
                  </div>
                  <p class="balance">{{ account.balance | currency:'ZAR':'symbol':'1.2-2' }}</p>
                </div>
                <a mat-stroked-button [routerLink]="['/transactions', account.id]">View Transactions</a>
              </mat-card-content>
            </mat-card>
          }
          @if (!accounts.length && !loading) {
            <p class="empty">No accounts yet. Create one to get started.</p>
          }
        </div>

        <!-- Create form -->
        <mat-card class="create-card">
          <mat-card-header>
            <mat-card-title>New Account</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="create()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Account Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. FNB Cheque" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Account Type</mat-label>
                <mat-select formControlName="accountType">
                  <mat-option value="Cheque">Cheque</mat-option>
                  <mat-option value="Savings">Savings</mat-option>
                  <mat-option value="FixedDeposit">Fixed Deposit</mat-option>
                </mat-select>
              </mat-form-field>

              @if (error) { <p class="error">{{ error }}</p> }

              <button mat-flat-button color="primary" class="full-width" type="submit" [disabled]="form.invalid || saving">
                {{ saving ? 'Creating...' : 'Create Account' }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
    .account-card { margin-bottom: 16px; }
    .account-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .account-header h3 { margin: 0 0 4px; }
    .chip { background: #e3f2fd; color: #1976d2; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
    .balance { margin: 0; font-size: 22px; font-weight: 700; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .error { color: #f44336; font-size: 14px; }
    .empty { color: #999; text-align: center; padding: 40px; }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  form: FormGroup;
  loading = false;
  saving  = false;
  error   = '';

  constructor(private accountService: AccountService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name:        ['', Validators.required],
      accountType: ['Cheque', Validators.required]
    });
  }

  ngOnInit() {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next:  accounts => { this.accounts = accounts; this.loading = false; },
      error: ()       => { this.loading = false; }
    });
  }

  create() {
    if (this.form.invalid) return;
    this.saving = true;
    this.error  = '';

    this.accountService.createAccount(this.form.value).subscribe({
      next: account => {
        this.accounts.unshift(account);
        this.form.reset({ accountType: 'Cheque' });
        this.saving = false;
      },
      error: err => {
        this.error  = err.error?.message ?? 'Failed to create account.';
        this.saving = false;
      }
    });
  }
}
