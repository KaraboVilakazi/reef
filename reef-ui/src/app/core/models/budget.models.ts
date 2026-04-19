export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  actualSpend: number;
  remainingAmount: number;
  burnRate: number;
  isOverBudget: boolean;
  isProjectedToOverrun: boolean;
  month: number;
  year: number;
}

export interface SetBudgetRequest {
  categoryId: number;
  limitAmount: number;
  month: number;
  year: number;
}
