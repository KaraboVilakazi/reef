import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FinanceHubService } from '../../../core/services/finance-hub.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <!-- Left brand panel -->
      <div class="brand-panel">
        <div class="brand-inner">
          <svg width="56" height="56" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:20px">
            <rect x="0" y="0" width="40" height="40" rx="10" fill="#00C896"/>
            <rect x="11" y="10" width="5" height="20" fill="#0D1B2A"/>
            <path d="M16 10 H26 A6 6 0 0 1 26 22 H16 Z" fill="#0D1B2A"/>
            <path d="M16 21 L28 32 H22 L16 25 Z" fill="#0D1B2A"/>
          </svg>
          <h1 class="brand-name">Reef</h1>
          <p class="brand-tagline">Your money, clearly.</p>
          <ul class="brand-features">
            <li>
              <span class="feat-icon">&#10003;</span>
              Multi-account management
            </li>
            <li>
              <span class="feat-icon">&#10003;</span>
              Real-time balance updates
            </li>
            <li>
              <span class="feat-icon">&#10003;</span>
              Smart budget tracking
            </li>
            <li>
              <span class="feat-icon">&#10003;</span>
              Spend analytics by category
            </li>
          </ul>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="form-panel">
        <div class="form-inner">
          <div class="form-header">
            <h2>Create your account</h2>
            <p>Start managing your finances today</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field-row">
              <div class="field">
                <label for="firstName">First name</label>
                <input id="firstName" formControlName="firstName" placeholder="Karabo" />
              </div>
              <div class="field">
                <label for="lastName">Last name</label>
                <input id="lastName" formControlName="lastName" placeholder="Vilakazi" />
              </div>
            </div>

            <div class="field">
              <label for="email">Email address</label>
              <input id="email" type="email" formControlName="email" placeholder="you@example.com" />
            </div>

            <div class="field">
              <label for="password">Password <span class="hint">min. 8 characters</span></label>
              <input id="password" type="password" formControlName="password" placeholder="Create a strong password" />
            </div>

            @if (error) {
              <div class="error-banner">{{ error }}</div>
            }

            <button type="submit" class="submit-btn" [disabled]="form.invalid || loading">
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p class="switch-link">
            Already have an account? <a routerLink="/auth/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      min-height: 100vh;
    }

    .brand-panel {
      flex: 0 0 45%;
      background: linear-gradient(160deg, #0D1B2A 0%, #1E3A5F 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }
    .brand-inner { max-width: 320px; }
    .brand-name {
      color: #fff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px;
      letter-spacing: -.5px;
    }
    .brand-tagline {
      color: rgba(255,255,255,.55);
      font-size: 16px;
      margin: 0 0 40px;
    }
    .brand-features {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .brand-features li {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255,255,255,.75);
      font-size: 14px;
    }
    .feat-icon {
      width: 22px;
      height: 22px;
      background: rgba(0,200,150,.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00C896;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background: #F0F2F7;
    }
    .form-inner {
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 24px rgba(0,0,0,.08);
    }
    .form-header { margin-bottom: 28px; }
    .form-header h2 {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -.3px;
    }
    .form-header p { margin: 0; font-size: 14px; color: #64748B; }

    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .field { margin-bottom: 16px; }
    .field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    .hint { font-weight: 400; color: #94A3B8; margin-left: 4px; }
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

    .error-banner {
      background: #FEE2E2;
      color: #B91C1C;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      background: #00C896;
      color: #0D1B2A;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      margin-top: 4px;
      transition: background .15s;
    }
    .submit-btn:hover:not(:disabled) { background: #00A87E; }
    .submit-btn:disabled { opacity: .6; cursor: not-allowed; }

    .switch-link {
      text-align: center;
      font-size: 13px;
      color: #64748B;
      margin: 20px 0 0;
    }
    .switch-link a { color: #00A87E; font-weight: 500; }
    .switch-link a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .brand-panel { display: none; }
      .form-panel { padding: 24px; }
      .field-row { grid-template-columns: 1fr; gap: 0; }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private hubService: FinanceHubService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error   = '';

    this.authService.register(this.form.value).subscribe({
      next: async () => {
        await this.hubService.connect();
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.error   = err.error?.message ?? 'Registration failed.';
        this.loading = false;
      }
    });
  }
}
