namespace Reef.API.Domain.Enums;

public enum TransactionType
{
    Income,
    Expense,
    TransferDebit,   // money leaving the source account
    TransferCredit   // money arriving at the destination account
}
