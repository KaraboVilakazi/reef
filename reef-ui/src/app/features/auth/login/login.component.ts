import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FinanceHubService } from '../../../core/services/finance-hub.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <!-- Left brand panel -->
      <div class="brand-panel">
        <div class="brand-inner">
          <div style="background:rgba(255,255,255,.12);border-radius:20px;padding:14px;margin-bottom:20px;width:fit-content;backdrop-filter:blur(6px)">
              <img src="reef-icon-512.png" alt="Reef" style="width:80px;height:80px;object-fit:contain;display:block;filter:saturate(0.42) brightness(0.68)" />
            </div>
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
          <div class="form-logo">
            <img src="reef-lockup.png" alt="Reef" />
          </div>
          <div class="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="email">Email address</label>
              <input id="email" type="email" formControlName="email" placeholder="you@example.com" />
            </div>

            <div class="field">
              <label for="password">Password</label>
              <input id="password" type="password" formControlName="password" placeholder="Your password" />
            </div>

            @if (error) {
              <div class="error-banner">{{ error }}</div>
            }

            <button type="submit" class="submit-btn" [disabled]="form.invalid || loading">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="switch-link">
            Don't have an account? <a routerLink="/auth/register">Create one</a>
          </p>
        </div>

        <!-- Trust badges -->
        <div class="trust-row">
          <div class="trust-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Bank-grade encryption</span>
          </div>
          <div class="trust-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>FSCA regulated</span>
          </div>
          <div class="trust-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Real-time alerts</span>
          </div>
        </div>

        <p class="byline">Designed &amp; built by <strong>Karabo Vilakazi</strong></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      min-height: 100vh;
    }

    /* Left panel */
    .brand-panel {
      flex: 0 0 45%;
      position: relative;
      overflow: hidden;
      background: url('/auth-hero-2.png') center top / cover no-repeat;
      display: flex;
      align-items: flex-end;
      padding: 48px;
    }
    .brand-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(11,45,26,.02) 0%,
        rgba(11,45,26,.35) 45%,
        rgba(11,45,26,.88) 100%
      );
    }
    .brand-inner {
      position: relative;
      z-index: 1;
      max-width: 320px;
      animation: fadeInUp .5s .15s ease both;
    }
    .brand-name {
      color: #fff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px;
      letter-spacing: -.5px;
    }
    .brand-tagline {
      color: rgba(255,255,255,.75);
      font-size: 16px;
      margin: 0 0 32px;
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
      color: rgba(255,255,255,.85);
      font-size: 14px;
    }
    .feat-icon {
      width: 22px;
      height: 22px;
      background: rgba(212,175,55,.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #D4AF37;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* Right panel */
    .form-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background: #F0F2F7;
      position: relative;
      overflow: hidden;
      gap: 28px;
    }
    .form-panel::before {
      content: '';
      position: absolute;
      top: -100px; right: -100px;
      width: 420px; height: 420px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212,175,55,.13) 0%, transparent 70%);
      pointer-events: none;
    }
    .form-panel::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -80px;
      width: 340px; height: 340px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(11,45,26,.09) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Trust badges */
    .trust-row {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 1;
      animation: fadeInUp .5s .25s ease both;
      flex-wrap: wrap;
      justify-content: center;
    }
    .trust-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,.7);
      border: 1px solid rgba(44,100,87,.2);
      border-radius: 20px;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 500;
      color: #374151;
      backdrop-filter: blur(4px);
      white-space: nowrap;
    }
    .trust-badge svg { color: #2C6457; flex-shrink: 0; }

    .byline {
      position: relative;
      z-index: 1;
      margin: 0;
      font-size: 12px;
      color: #94A3B8;
      animation: fadeIn .6s .4s ease both;
    }
    .byline strong { color: #64748B; font-weight: 600; }
    .form-inner {
      width: 100%;
      max-width: 400px;
      background: linear-gradient(160deg, #fffef9 0%, #fff 100%);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,.10);
      border-top: 3px solid #2C6457;
      animation: fadeInUp .4s ease both;
    }
    .form-logo {
      margin-bottom: 28px;
    }
    .form-logo img {
      height: 34px;
      width: auto;
      max-width: 100%;
      display: block;
      object-fit: contain;
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
      border-color: #D4AF37;
      box-shadow: 0 0 0 3px rgba(212,175,55,.15);
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
      background: #D4AF37;
      color: #0B2D1A;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      margin-top: 4px;
      transition: background .15s, transform .15s, box-shadow .15s;
    }
    .submit-btn:hover:not(:disabled) {
      background: #B8960C;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(212,175,55,.3);
    }
    .submit-btn:disabled { opacity: .6; cursor: not-allowed; }

    .switch-link {
      text-align: center;
      font-size: 13px;
      color: #64748B;
      margin: 20px 0 0;
    }
    .switch-link a { color: #B8960C; font-weight: 500; }
    .switch-link a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .brand-panel { display: none; }
      .form-panel { padding: 24px; }
    }
  `]
})
export class LoginComponent {
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
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error   = '';

    this.authService.login(this.form.value).subscribe({
      next: async () => {
        await this.hubService.connect();
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.error   = err.error?.message ?? 'Login failed.';
        this.loading = false;
      }
    });
  }
}
