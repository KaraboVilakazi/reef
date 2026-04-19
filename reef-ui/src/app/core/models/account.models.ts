export interface Account {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface CreateAccountRequest {
  name: string;
  accountType: 'Cheque' | 'Savings' | 'FixedDeposit';
}
