import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/models/account.models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, NgClass],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Accounts</h1>
          <p class="subtitle">Manage your linked bank accounts</p>
        </div>
      </div>

      <div class="layout">
        <!-- Account cards -->
        <div class="accounts-grid">
          @for (account of accounts; track account.id) {
            <div class="bank-card" [ngClass]="'card-' + account.accountType.toLowerCase()">
              <div class="bank-card-top">
                <div class="bank-card-type">{{ account.accountType }} Account</div>
                <div class="bank-card-chip">
                  <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                    <rect width="28" height="22" rx="4" fill="rgba(255,255,255,.25)"/>
                    <line x1="0" y1="11" x2="28" y2="11" stroke="rgba(255,255,255,.2)" stroke-width="1"/>
                    <line x1="14" y1="0" x2="14" y2="22" stroke="rgba(255,255,255,.2)" stroke-width="1"/>
                  </svg>
                </div>
              </div>
              <div class="bank-card-name">{{ account.name }}</div>
              <div class="bank-card-balance">
                <span class="bank-card-label">Available Balance</span>
                <span class="bank-card-amount">{{ account.balance | currency:'ZAR':'symbol':'1.2-2' }}</span>
              </div>
              <a class="bank-card-btn" [routerLink]="['/transactions', account.id]">
                View Transactions →
              </a>
            </div>
          }

          @if (!accounts.length && !loading) {
            <div class="card empty-state">
              <p>No accounts yet. Create your first account.</p>
            </div>
          }
        </div>

        <!-- Create form -->
        <div class="card create-card">
          <div class="card-header">
            <h2>New Account</h2>
          </div>

          <form [formGroup]="form" (ngSubmit)="create()">
            <div class="field">
              <label for="name">Account Name</label>
              <input id="name" formControlName="name" placeholder="e.g. Capitec Cheque" />
            </div>

            <div class="field">
              <label for="type">Account Type</label>
              <div class="select-wrap">
                <select id="type" formControlName="accountType">
                  <option value="Cheque">Cheque Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="FixedDeposit">Fixed Deposit</option>
                </select>
                <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            @if (error) {
              <div class="error-banner">{{ error }}</div>
            }

            <button type="submit" class="btn-primary full-width" [disabled]="form.invalid || saving">
              {{ saving ? 'Creating...' : 'Create Account' }}
            </button>
          </form>

          <!-- Account type guide -->
          <div class="type-guide">
            <p class="guide-title">Account types</p>
            <div class="guide-item">
              <span class="guide-dot cheque"></span>
              <div>
                <p class="guide-name">Cheque</p>
                <p class="guide-desc">Day-to-day transactional account</p>
              </div>
            </div>
            <div class="guide-item">
              <span class="guide-dot savings"></span>
              <div>
                <p class="guide-name">Savings</p>
                <p class="guide-desc">Earn interest on your balance</p>
              </div>
            </div>
            <div class="guide-item">
              <span class="guide-dot fixed"></span>
              <div>
                <p class="guide-name">Fixed Deposit</p>
                <p class="guide-desc">Fixed-term higher-yield savings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
      align-items: start;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    /* Physical bank card style */
    .bank-card {
      border-radius: 16px;
      padding: 24px;
      color: #fff;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 180px;
      box-shadow: 0 8px 24px rgba(0,0,0,.18);
      position: relative;
      overflow: hidden;
      animation: fadeInUp .35s ease both;
      transition: transform .2s, box-shadow .2s;
    }
    .bank-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 32px rgba(0,0,0,.22);
    }
    .bank-card::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 160px; height: 160px;
      border-radius: 50%;
      background: rgba(255,255,255,.06);
    }
    .bank-card::after {
      content: '';
      position: absolute;
      bottom: -30px; left: 20px;
      width: 120px; height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,.04);
    }

    .card-cheque       { background: linear-gradient(145deg, #0B2D1A 0%, #1A5C3A 100%); }
    .card-savings      { background: linear-gradient(145deg, #064E3B 0%, #059669 100%); }
    .card-fixeddeposit { background: linear-gradient(145deg, #3B0764 0%, #7C3AED 100%); }

    .bank-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .bank-card-type {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .8px;
      opacity: .7;
    }
    .bank-card-name {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -.2px;
    }
    .bank-card-balance {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .bank-card-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .6px;
      opacity: .6;
    }
    .bank-card-amount {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -.3px;
    }
    .bank-card-btn {
      display: inline-block;
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,.8);
      border: 1px solid rgba(255,255,255,.25);
      padding: 7px 14px;
      border-radius: 8px;
      transition: all .15s;
      width: fit-content;
      position: relative;
      z-index: 1;
    }
    .bank-card-btn:hover {
      background: rgba(255,255,255,.1);
      color: #fff;
      border-color: rgba(255,255,255,.4);
    }

    /* Create card */
    .create-card { position: sticky; top: 80px; }

    .select-wrap { position: relative; }
    .select-wrap select {
      width: 100%;
      padding: 11px 36px 11px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: #0F172A;
      background: #fff;
      outline: none;
      appearance: none;
      cursor: pointer;
      transition: border-color .15s, box-shadow .15s;
    }
    .select-wrap select:focus {
      border-color: #D4AF37;
      box-shadow: 0 0 0 3px rgba(212,175,55,.15);
    }
    .select-arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }

    .full-width { width: 100%; margin-top: 4px; }

    .error-banner {
      background: #FEE2E2;
      color: #B91C1C;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    /* Type guide */
    .type-guide {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #F1F5F9;
    }
    .guide-title {
      font-size: 12px;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: .5px;
      margin: 0 0 12px;
    }
    .guide-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }
    .guide-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }
    .guide-dot.cheque  { background: #1A5C3A; }
    .guide-dot.savings { background: #059669; }
    .guide-dot.fixed   { background: #7C3AED; }
    .guide-name {
      margin: 0 0 1px;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }
    .guide-desc { margin: 0; font-size: 12px; color: #94A3B8; }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .create-card { position: static; }
    }
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
