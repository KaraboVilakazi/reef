import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface BalanceUpdate {
  accountId: string;
  newBalance: number;
}

// This service manages the SignalR WebSocket connection to the .NET hub.
// It exposes an RxJS Subject that Angular components subscribe to —
// when the backend pushes a BalanceUpdated event, every subscribed
// component reacts automatically without polling.
@Injectable({ providedIn: 'root' })
export class FinanceHubService {
  private connection: signalR.HubConnection | null = null;

  // Subject is like an EventEmitter — components subscribe to balanceUpdates$
  // and react whenever the backend pushes a new balance
  balanceUpdates$ = new Subject<BalanceUpdate>();

  constructor(private authService: AuthService) {}

  async connect() {
    const token = this.authService.getToken();
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/finance`, {
        // JWT passed as query param — WebSocket handshake can't set headers
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    // Listen for balance updates pushed from TransactionService
    this.connection.on('BalanceUpdated', (accountId: string, newBalance: number) => {
      this.balanceUpdates$.next({ accountId, newBalance });
    });

    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (err) {
      console.error('SignalR connection failed:', err);
    }
  }

  async subscribeToAccount(accountId: string) {
    await this.connection?.invoke('SubscribeToAccount', accountId);
  }

  async disconnect() {
    await this.connection?.stop();
  }
}
