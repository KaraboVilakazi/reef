import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { BudgetService } from '../../core/services/budget.service';
import { Budget } from '../../core/models/budget.models';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, NgClass],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Budgets</h1>
          <p class="subtitle">{{ monthName }} spending limits</p>
        </div>
      </div>

      <div class="layout">
        <!-- Budget cards -->
        <div class="budgets-list">
          @for (budget of budgets; track budget.id) {
            <div class="budget-card" [ngClass]="budget.isOverBudget ? 'over' : budget.isProjectedToOverrun ? 'warning' : 'ok'">
              <div class="budget-top">
                <div class="budget-cat-wrap">
                  <span class="budget-cat-icon">{{ categoryIcon(budget.category) }}</span>
                  <span class="budget-cat">{{ budget.category }}</span>
                </div>
                @if (budget.isOverBudget) {
                  <span class="badge danger">Over budget</span>
                } @else if (budget.isProjectedToOverrun) {
                  <span class="badge warning">Projected overrun</span>
                } @else {
                  <span class="badge success">On track</span>
                }
              </div>

              <!-- Progress bar -->
              <div class="progress-track">
                <div class="progress-fill"
                  [ngClass]="budget.isOverBudget ? 'fill-danger' : budget.isProjectedToOverrun ? 'fill-warning' : 'fill-ok'"
                  [style.width.%]="progressPercent(budget)">
                </div>
              </div>

              <div class="budget-stats">
                <div class="stat-item">
                  <p class="stat-val">{{ budget.actualSpend | currency:'ZAR':'symbol':'1.0-0' }}</p>
                  <p class="stat-lbl">Spent</p>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <p class="stat-val">{{ budget.remainingAmount | currency:'ZAR':'symbol':'1.0-0' }}</p>
                  <p class="stat-lbl">Remaining</p>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <p class="stat-val">{{ budget.limitAmount | currency:'ZAR':'symbol':'1.0-0' }}</p>
                  <p class="stat-lbl">Budget</p>
                </div>
              </div>

              <div class="burn-rate">
                Projected end-of-month spend:
                <strong>{{ budget.burnRate | currency:'ZAR':'symbol':'1.0-0' }}</strong>
              </div>
            </div>
          }

          @if (!budgets.length) {
            <div class="card empty-state">
              <p>No budgets set for {{ monthName }}.</p>
              <p>Set a budget to track your spending against monthly limits.</p>
            </div>
          }
        </div>

        <!-- Set budget form -->
        <div class="card create-card">
          <div class="card-header">
            <h2>Set Budget</h2>
          </div>

          <form [formGroup]="form" (ngSubmit)="save()">
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
              <label>Monthly Limit (ZAR)</label>
              <input type="number" formControlName="limitAmount" placeholder="e.g. 3000" />
            </div>

            @if (error) {
              <div class="error-banner">{{ error }}</div>
            }

            <button type="submit" class="btn-primary full-width" [disabled]="form.invalid || saving">
              {{ saving ? 'Saving...' : 'Set Budget' }}
            </button>
          </form>

          <div class="budget-tips">
            <p class="tips-title">Budgeting tips</p>
            <div class="tip">
              <span class="tip-icon">💡</span>
              <p>The <strong>50/30/20 rule</strong>: 50% needs, 30% wants, 20% savings.</p>
            </div>
            <div class="tip">
              <span class="tip-icon">📊</span>
              <p>Track <strong>Transport & Petrol</strong> — one of SA's fastest-rising costs.</p>
            </div>
            <div class="tip">
              <span class="tip-icon">📱</span>
              <p>Don't forget <strong>Airtime/Data</strong> in your monthly budget.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }

    .budgets-list { display: flex; flex-direction: column; gap: 16px; }

    .budget-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,.07);
      border-left: 4px solid transparent;
    }
    .budget-card.ok      { border-left-color: #16A34A; }
    .budget-card.warning { border-left-color: #D97706; }
    .budget-card.over    { border-left-color: #EF4444; }

    .budget-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .budget-cat-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .budget-cat-icon { font-size: 20px; line-height: 1; }
    .budget-cat {
      font-size: 15px;
      font-weight: 600;
      color: #0F172A;
    }

    /* Badge override for local context */
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .2px;
    }
    .badge.success { background: #DCFCE7; color: #16A34A; }
    .badge.warning { background: #FEF3C7; color: #D97706; }
    .badge.danger  { background: #FEE2E2; color: #EF4444; }

    /* Progress bar */
    .progress-track {
      height: 8px;
      background: #F1F5F9;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width .4s ease;
    }
    .fill-ok      { background: #22C55E; }
    .fill-warning { background: #F59E0B; }
    .fill-danger  { background: #EF4444; }

    /* Stats row */
    .budget-stats {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
    }
    .stat-item { flex: 1; text-align: center; }
    .stat-val {
      margin: 0 0 2px;
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
    }
    .stat-lbl { margin: 0; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: .4px; }
    .stat-divider { width: 1px; height: 32px; background: #F1F5F9; flex-shrink: 0; }

    .burn-rate {
      font-size: 12px;
      color: #94A3B8;
      padding-top: 12px;
      border-top: 1px solid #F8FAFC;
    }
    .burn-rate strong { color: #374151; }

    /* Create card */
    .create-card { position: sticky; top: 80px; }

    .field { margin-bottom: 16px; }
    .field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    .field input {
      width: 100%;
      padding: 11px 14px;
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
      padding: 11px 32px 11px 14px;
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

    .full-width { width: 100%; margin-top: 4px; }

    .error-banner {
      background: #FEE2E2;
      color: #B91C1C;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    /* Tips section */
    .budget-tips {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #F1F5F9;
    }
    .tips-title {
      font-size: 12px;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: .5px;
      margin: 0 0 12px;
    }
    .tip {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: flex-start;
    }
    .tip-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
    .tip p { margin: 0; font-size: 12px; color: #64748B; line-height: 1.5; }
    .tip strong { color: #374151; }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .create-card { position: static; }
    }
  `]
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  form: FormGroup;
  saving    = false;
  error     = '';
  monthName = '';

  constructor(private budgetService: BudgetService, private fb: FormBuilder) {
    this.form = this.fb.group({
      categoryId:  [4, Validators.required],
      limitAmount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    this.loadBudgets();
  }

  categoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Groceries: '🛒', Transport: '🚗', Rent: '🏠', Utilities: '💡',
      Entertainment: '🎬', Healthcare: '🏥', Education: '📚',
      Clothing: '👕', Other: '📦', Airtime: '📱', Salary: '💼',
      Freelance: '💻', Investment: '📈'
    };
    return icons[category] ?? '💳';
  }

  progressPercent(budget: Budget): number {
    return Math.min((budget.actualSpend / budget.limitAmount) * 100, 100);
  }

  private loadBudgets() {
    this.budgetService.getBudgets().subscribe(b => this.budgets = b);
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const now   = new Date();

    this.budgetService.setBudget({
      ...this.form.value,
      month: now.getMonth() + 1,
      year:  now.getFullYear()
    }).subscribe({
      next: budget => {
        const idx = this.budgets.findIndex(b => b.id === budget.id);
        idx >= 0 ? this.budgets.splice(idx, 1, budget) : this.budgets.unshift(budget);
        this.form.reset({ categoryId: 4 });
        this.saving = false;
      },
      error: err => { this.error = err.error?.message ?? 'Failed.'; this.saving = false; }
    });
  }
}
