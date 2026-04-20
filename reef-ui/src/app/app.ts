import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (authService.isLoggedIn()) {
      <div class="shell">

        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-brand">
            <!-- Icon + Wordmark lockup -->
            <div class="brand-lockup">
              <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#00C896"/>
                <rect x="18" y="18" width="13" height="50" rx="1.5" fill="#0D1B2A"/>
                <path d="M31 18 H59 C76 18 79 27 79 35 C79 43 76 52 59 52 H31 Z" fill="#0D1B2A"/>
                <path d="M31 26 H57 C67 26 70 30 70 35 C70 40 67 44 57 44 H31 Z" fill="#00C896"/>
                <path d="M18 63 Q36 56 54 63 Q63 67 72 62" stroke="#0D1B2A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                <path d="M18 75 Q37 68 56 75 Q66 79 75 74" stroke="#0D1B2A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                <path d="M18 87 Q38 80 58 87 Q68 91 78 86" stroke="#0D1B2A" stroke-width="5.5" fill="none" stroke-linecap="round"/>
              </svg>
              <span class="brand-name">Reef</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Overview
            </a>
            <a routerLink="/accounts" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Accounts
            </a>
            <a routerLink="/budgets" routerLinkActive="active" class="nav-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/>
              </svg>
              Budgets
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="user-row">
              <div class="user-avatar">{{ initials }}</div>
              <div class="user-info">
                <p class="user-name">{{ user?.firstName }} {{ user?.lastName }}</p>
                <p class="user-email">{{ user?.email }}</p>
              </div>
            </div>
            <button class="sign-out-btn" (click)="logout()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        <!-- Main area -->
        <div class="main">
          <header class="topbar">
            <h1 class="topbar-title">{{ pageTitle }}</h1>
            <div class="topbar-right">
              <span class="topbar-month">{{ monthName }}</span>
              <div class="topbar-avatar" title="{{ user?.firstName }} {{ user?.lastName }}">{{ initials }}</div>
            </div>
          </header>

          <div class="content">
            <router-outlet />
          </div>
        </div>

      </div>
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ── Sidebar ─────────────────────────────── */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: #0D1B2A;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-brand {
      padding: 20px 20px 18px;
      border-bottom: 1px solid rgba(255,255,255,.06);
      margin-bottom: 8px;
    }
    .brand-lockup {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-name {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -.3px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255,255,255,.5);
      transition: all .15s;
      cursor: pointer;
    }
    .nav-item:hover {
      color: rgba(255,255,255,.85);
      background: rgba(255,255,255,.07);
    }
    .nav-item.active {
      color: #fff;
      background: rgba(255,255,255,.1);
    }
    .nav-item.active svg {
      color: #00C896;
    }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid rgba(255,255,255,.06);
    }
    .user-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #00C896;
      color: #0D1B2A;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .user-info { min-width: 0; }
    .user-name {
      margin: 0 0 1px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      margin: 0;
      font-size: 11px;
      color: rgba(255,255,255,.35);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sign-out-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      background: transparent;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 8px;
      color: rgba(255,255,255,.45);
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all .15s;
    }
    .sign-out-btn:hover {
      background: rgba(255,255,255,.06);
      color: rgba(255,255,255,.75);
      border-color: rgba(255,255,255,.22);
    }

    /* ── Main ────────────────────────────────── */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .topbar {
      height: 60px;
      background: #fff;
      border-bottom: 1px solid #E2E8F0;
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .topbar-title {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -.2px;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .topbar-month {
      font-size: 13px;
      color: #94A3B8;
      font-weight: 500;
    }
    .topbar-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #0D1B2A;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      cursor: default;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      background: #F0F2F7;
    }
  `]
})
export class App {
  constructor(public authService: AuthService, private router: Router) {}

  get user() { return this.authService.currentUser(); }

  get initials(): string {
    const u = this.user;
    if (!u) return '';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  }

  get pageTitle(): string {
    const url = this.router.url;
    if (url.startsWith('/dashboard'))    return 'Overview';
    if (url.startsWith('/accounts'))     return 'Accounts';
    if (url.startsWith('/transactions')) return 'Transactions';
    if (url.startsWith('/budgets'))      return 'Budgets';
    return 'Reef';
  }

  get monthName(): string {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  logout() { this.authService.logout(); }
}
