export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  category: string;
  destinationAccountId: string | null;
  recurringInterval: string;
  transactionDate: string;
}

export interface DepositRequest {
  accountId: string;
  amount: number;
  categoryId: number;
  description: string;
  recurringInterval?: number;
}

export interface WithdrawRequest {
  accountId: string;
  amount: number;
  categoryId: number;
  description: string;
  recurringInterval?: number;
}

export interface TransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  description: string;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  spendByCategory: CategorySpend[];
}

export interface CategorySpend {
  category: string;
  amount: number;
  transactionCount: number;
}
