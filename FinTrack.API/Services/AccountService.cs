using Reef.API.Common.Exceptions;
using Reef.API.Data;
using Reef.API.Domain.Entities;
using Reef.API.DTOs.Account;
using Microsoft.EntityFrameworkCore;

namespace Reef.API.Services;

public class AccountService(ReefDbContext db)
{
    public async Task<AccountResponse> CreateAccountAsync(Guid userId, CreateAccountRequest request)
    {
        var account = new Account
        {
            UserId      = userId,
            Name        = request.Name,
            AccountType = request.AccountType
        };

        db.Accounts.Add(account);
        await db.SaveChangesAsync();

        return AccountResponse.From(account);
    }

    public async Task<List<AccountResponse>> GetAccountsAsync(Guid userId)
    {
        // LINQ in C# is equivalent to Java Streams but integrated into the language.
        // EF translates this directly to SQL — no N+1 issues.
        return await db.Accounts
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.CreatedAt)
            .Select(a => AccountResponse.From(a))
            .ToListAsync();
    }

    public async Task<AccountResponse> GetAccountAsync(Guid userId, Guid accountId)
    {
        var account = await db.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId)
            ?? throw AppException.NotFound("Account not found.");

        return AccountResponse.From(account);
    }
}
