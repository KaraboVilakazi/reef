using Reef.API.Domain.Entities;

namespace Reef.API.DTOs.Transaction;

public record TransactionResponse(
    Guid     Id,
    string   Type,
    decimal  Amount,
    decimal  BalanceAfter,
    string   Description,
    string   Category,
    Guid?    DestinationAccountId,
    string   RecurringInterval,
    DateTime TransactionDate
)
{
    public static TransactionResponse From(Domain.Entities.Transaction t) => new(
        t.Id,
        t.Type.ToString(),
        t.Amount,
        t.BalanceAfter,
        t.Description,
        t.Category.Name,
        t.DestinationAccountId,
        t.RecurringInterval.ToString(),
        t.TransactionDate
    );
}
