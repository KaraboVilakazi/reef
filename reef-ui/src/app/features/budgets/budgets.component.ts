import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { BudgetService } from '../../core/services/budget.service';
import { Budget } from '../../core/models/budget.models';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
            MatSelectModule, MatButtonModule, MatProgressBarModule, MatIconModule,
            RouterLink, CurrencyPipe, NgClass],
  template: `
    <div class="page">
      <div class="header">
        <h1>Budgets — {{ monthName }}</h1>
        <a mat-button routerLink="/dashboard">← Dashboard</a>
      </div>

      <div class="layout">
        <!-- Budget cards -->
        <div>
          @for (budget of budgets; track budget.id) {
            <mat-card class="budget-card" [ngClass]="{ 'over': budget.isOverBudget, 'warning': budget.isProjectedToOverrun && !budget.isOverBudget }">
              <mat-card-content>
                <div class="budget-header">
                  <span class="category">{{ budget.category }}</span>
                  @if (budget.isOverBudget) {
                    <span class="badge over">Over budget</span>
                  } @else if (budget.isProjectedToOverrun) {
                    <span class="badge warning">Projected overrun</span>
                  }
                </div>

                <mat-progress-bar
                  [value]="progressPercent(budget)"
                  [color]="budget.isOverBudget ? 'warn' : budget.isProjectedToOverrun ? 'accent' : 'primary'"
                  class="progress" />

                <div class="budget-stats">
                  <span>{{ budget.actualSpend | currency:'ZAR':'symbol':'1.0-0' }} spent</span>
                  <span>{{ budget.limitAmount | currency:'ZAR':'symbol':'1.0-0' }} limit</span>
                </div>

                <p class="burn-rate">
                  Projected end-of-month: <strong>{{ budget.burnRate | currency:'ZAR':'symbol':'1.0-0' }}</strong>
                  ({{ budget.remainingAmount | currency:'ZAR':'symbol':'1.0-0' }} remaining)
                </p>
              </mat-card-content>
            </mat-card>
          }
          @if (!budgets.length) {
            <p class="empty">No budgets set for this month. Create one to track your spending.</p>
          }
        </div>

        <!-- Set budget form -->
        <mat-card class="create-card">
          <mat-card-header><mat-card-title>Set Budget</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="save()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="categoryId">
                  <mat-option [value]="4">Groceries</mat-option>
                  <mat-option [value]="5">Transport</mat-option>
                  <mat-option [value]="6">Rent</mat-option>
                  <mat-option [value]="7">Utilities</mat-option>
                  <mat-option [value]="8">Entertainment</mat-option>
                  <mat-option [value]="9">Healthcare</mat-option>
                  <mat-option [value]="10">Education</mat-option>
                  <mat-option [value]="11">Clothing</mat-option>
                  <mat-option [value]="12">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Monthly Limit (ZAR)</mat-label>
                <input matInput type="number" formControlName="limitAmount" />
              </mat-form-field>

              @if (error) { <p class="error">{{ error }}</p> }

              <button mat-flat-button color="primary" class="full-width" type="submit" [disabled]="form.invalid || saving">
                {{ saving ? 'Saving...' : 'Set Budget' }}
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
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
    .budget-card { margin-bottom: 16px; border-left: 4px solid #2196f3; }
    .budget-card.over { border-left-color: #f44336; }
    .budget-card.warning { border-left-color: #ff9800; }
    .budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .category { font-weight: 600; font-size: 16px; }
    .badge { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge.over    { background: #ffebee; color: #c62828; }
    .badge.warning { background: #fff8e1; color: #e65100; }
    .progress { margin-bottom: 8px; }
    .budget-stats { display: flex; justify-content: space-between; font-size: 13px; color: #555; }
    .burn-rate { font-size: 13px; color: #666; margin: 8px 0 0; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .error { color: #f44336; font-size: 14px; }
    .empty { color: #999; text-align: center; padding: 40px; }
  `]
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  form: FormGroup;
  saving  = false;
  error   = '';
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

  private loadBudgets() {
    this.budgetService.getBudgets().subscribe(b => this.budgets = b);
  }

  progressPercent(budget: Budget): number {
    return Math.min((budget.actualSpend / budget.limitAmount) * 100, 100);
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
