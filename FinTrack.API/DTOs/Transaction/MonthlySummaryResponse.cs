namespace Reef.API.DTOs.Transaction;

public record MonthlySummaryResponse(
    int                          Month,
    int                          Year,
    decimal                      TotalIncome,
    decimal                      TotalExpenses,
    decimal                      NetSavings,
    IEnumerable<CategorySpend>   SpendByCategory
);

public record CategorySpend(
    string  Category,
    decimal Amount,
    int     TransactionCount
);
