import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (authService.isLoggedIn()) {
      <nav class="nav">
        <div class="nav-inner">
          <div class="nav-brand">
            <div class="nav-logo">R</div>
            <span class="nav-title">Reef</span>
          </div>
          <div class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active">Overview</a>
            <a routerLink="/accounts" routerLinkActive="active">Accounts</a>
            <a routerLink="/budgets" routerLinkActive="active">Budgets</a>
          </div>
          <button class="nav-logout" (click)="logout()">Sign out</button>
        </div>
      </nav>
    }
    <router-outlet />
  `,
  styles: [`
    .nav {
      background: #0D1B2A;
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .nav-logo {
      width: 32px;
      height: 32px;
      background: #00C896;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      color: #0D1B2A;
      font-family: 'Inter', sans-serif;
    }
    .nav-title {
      font-size: 18px;
      font-weight: 700;
      color: white;
      letter-spacing: -.3px;
      font-family: 'Inter', sans-serif;
    }
    .nav-links {
      display: flex;
      gap: 4px;
      flex: 1;
    }
    .nav-links a {
      color: rgba(255,255,255,.55);
      font-size: 14px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 8px;
      transition: all .15s;
      font-family: 'Inter', sans-serif;
    }
    .nav-links a:hover { color: rgba(255,255,255,.85); background: rgba(255,255,255,.07); }
    .nav-links a.active { color: #fff; background: rgba(255,255,255,.1); }
    .nav-logout {
      margin-left: auto;
      background: transparent;
      border: 1px solid rgba(255,255,255,.18);
      color: rgba(255,255,255,.65);
      font-size: 13px;
      font-weight: 500;
      padding: 6px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all .15s;
      flex-shrink: 0;
    }
    .nav-logout:hover {
      background: rgba(255,255,255,.08);
      color: white;
      border-color: rgba(255,255,255,.35);
    }
  `]
})
export class App {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
