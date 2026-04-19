namespace Reef.API.DTOs.Budget;

public record BudgetResponse(
    Guid    Id,
    string  Category,
    decimal LimitAmount,
    decimal ActualSpend,       // computed from transactions
    decimal RemainingAmount,   // LimitAmount - ActualSpend
    decimal BurnRate,          // projected end-of-month spend based on current daily rate
    bool    IsOverBudget,
    bool    IsProjectedToOverrun,  // burn rate > limit
    int     Month,
    int     Year
);
