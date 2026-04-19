using Reef.API.Domain.Entities;

namespace Reef.API.DTOs.Account;

public record AccountResponse(
    Guid    Id,
    string  Name,
    string  AccountType,
    decimal Balance,
    string  Currency,
    DateTime CreatedAt
)
{
    public static AccountResponse From(Domain.Entities.Account account) => new(
        account.Id,
        account.Name,
        account.AccountType.ToString(),
        account.Balance,
        account.Currency,
        account.CreatedAt
    );
}
