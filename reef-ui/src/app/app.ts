import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    @if (authService.isLoggedIn()) {
      <mat-toolbar color="primary">
        <span class="brand">Reef</span>
        <span class="spacer"></span>
        <a mat-button routerLink="/dashboard">Dashboard</a>
        <a mat-button routerLink="/accounts">Accounts</a>
        <a mat-button routerLink="/budgets">Budgets</a>
        <button mat-icon-button (click)="logout()" title="Sign out">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>
    }
    <router-outlet />
  `,
  styles: [`
    .brand   { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
    .spacer  { flex: 1; }
  `]
})
export class App {
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
  }
}
