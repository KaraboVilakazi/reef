using Reef.API.Common.Exceptions;
using Reef.API.Data;
using Reef.API.Domain.Entities;
using Reef.API.Domain.Enums;
using Reef.API.DTOs.Transaction;
using Reef.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Reef.API.Services;

public class TransactionService(
    ReefDbContext db,
    IHubContext<FinanceHub> hub)
{
    public async Task<TransactionResponse> DepositAsync(Guid userId, DepositRequest request)
    {
        var account = await GetOwnedAccountAsync(userId, request.AccountId);

        await ValidateCategoryAsync(request.CategoryId, CategoryType.Income);

        account.Balance += request.Amount;

        var transaction = new Transaction
        {
            AccountId         = account.Id,
            CategoryId        = request.CategoryId,
            Type              = TransactionType.Income,
            Amount            = request.Amount,
            Description       = request.Description,
            BalanceAfter      = account.Balance,
            RecurringInterval = (RecurringInterval)request.RecurringInterval,
            NextOccurrence    = ComputeNextOccurrence((RecurringInterval)request.RecurringInterval)
        };

        db.Transactions.Add(transaction);
        await db.SaveChangesAsync();

        // SignalR — push the new balance to any connected dashboard in real time.
        // The Angular frontend subscribes to this event via RxJS.
        await hub.Clients.User(userId.ToString())
            .SendAsync("BalanceUpdated", account.Id, account.Balance);

        return await ToResponseAsync(transaction);
    }

    public async Task<TransactionResponse> WithdrawAsync(Guid userId, WithdrawRequest request)
    {
        var account = await GetOwnedAccountAsync(userId, request.AccountId);

        if (account.Balance < request.Amount)
            throw AppException.Unprocessable("Insufficient funds.");

        await ValidateCategoryAsync(request.CategoryId, CategoryType.Expense);

        account.Balance -= request.Amount;

        var transaction = new Transaction
        {
            AccountId         = account.Id,
            CategoryId        = request.CategoryId,
            Type              = TransactionType.Expense,
            Amount            = request.Amount,
            Description       = request.Description,
            BalanceAfter      = account.Balance,
            RecurringInterval = (RecurringInterval)request.RecurringInterval,
            NextOccurrence    = ComputeNextOccurrence((RecurringInterval)request.RecurringInterval)
        };

        db.Transactions.Add(transaction);
        await db.SaveChangesAsync();

        await hub.Clients.User(userId.ToString())
            .SendAsync("BalanceUpdated", account.Id, account.Balance);

        return await ToResponseAsync(transaction);
    }

    public async Task<TransactionResponse> TransferAsync(Guid userId, TransferRequest request)
    {
        if (request.SourceAccountId == request.DestinationAccountId)
            throw AppException.Unprocessable("Source and destination accounts must be different.");

        // Load both accounts — we need to verify ownership of the source.
        var source = await GetOwnedAccountAsync(userId, request.SourceAccountId);
        var dest   = await db.Accounts.FirstOrDefaultAsync(a => a.Id == request.DestinationAccountId)
            ?? throw AppException.NotFound("Destination account not found.");

        if (source.Balance < request.Amount)
            throw AppException.Unprocessable("Insufficient funds for transfer.");

        // Deadlock prevention — lock accounts in consistent ID order (same pattern as Imali).
        // If Thread A transfers A→B and Thread B transfers B→A simultaneously,
        // both threads acquire locks in the same order (lower GUID first),
        // so they queue rather than deadlock.
        var (first, second) = source.Id.CompareTo(dest.Id) < 0
            ? (source, dest)
            : (dest, source);

        lock (first)
        lock (second)
        {
            source.Balance -= request.Amount;
            dest.Balance   += request.Amount;
        }

        var debit = new Transaction
        {
            AccountId            = source.Id,
            CategoryId           = 12,   // "Other" — transfers aren't categorised as expenses
            Type                 = TransactionType.TransferDebit,
            Amount               = request.Amount,
            Description          = request.Description,
            BalanceAfter         = source.Balance,
            DestinationAccountId = dest.Id
        };

        var credit = new Transaction
        {
            AccountId            = dest.Id,
            CategoryId           = 12,
            Type                 = TransactionType.TransferCredit,
            Amount               = request.Amount,
            Description          = request.Description,
            BalanceAfter         = dest.Balance,
            DestinationAccountId = source.Id
        };

        db.Transactions.AddRange(debit, credit);
        await db.SaveChangesAsync();

        // Notify both sides of the transfer in real time
        await hub.Clients.User(userId.ToString())
            .SendAsync("BalanceUpdated", source.Id, source.Balance);
        await hub.Clients.User(userId.ToString())
            .SendAsync("BalanceUpdated", dest.Id, dest.Balance);

        return await ToResponseAsync(debit);
    }

    public async Task<List<TransactionResponse>> GetTransactionsAsync(
        Guid userId, Guid accountId, int page, int size)
    {
        await GetOwnedAccountAsync(userId, accountId);  // ownership check

        return await db.Transactions
            .Where(t => t.AccountId == accountId)
            .Include(t => t.Category)
            .OrderByDescending(t => t.TransactionDate)
            .Skip(page * size)
            .Take(size)
            .Select(t => TransactionResponse.From(t))
            .ToListAsync();
    }

    public async Task<MonthlySummaryResponse> GetMonthlySummaryAsync(Guid userId, int month, int year)
    {
        // Pull all transactions across all user accounts for the given month.
        // GroupBy in LINQ maps directly to GROUP BY in SQL via EF.
        var transactions = await db.Transactions
            .Include(t => t.Category)
            .Where(t =>
                t.Account.UserId == userId &&
                t.TransactionDate.Month == month &&
                t.TransactionDate.Year  == year)
            .ToListAsync();

        var totalIncome   = transactions.Where(t => t.Type == TransactionType.Income)
                                        .Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == TransactionType.Expense)
                                        .Sum(t => t.Amount);

        var spendByCategory = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .GroupBy(t => t.Category.Name)
            .Select(g => new CategorySpend(g.Key, g.Sum(t => t.Amount), g.Count()))
            .OrderByDescending(c => c.Amount)
            .ToList();

        return new MonthlySummaryResponse(
            month,
            year,
            totalIncome,
            totalExpenses,
            NetSavings: totalIncome - totalExpenses,
            spendByCategory
        );
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private async Task<Domain.Entities.Account> GetOwnedAccountAsync(Guid userId, Guid accountId)
    {
        return await db.Accounts.FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId)
            ?? throw AppException.NotFound("Account not found.");
    }

    private async Task ValidateCategoryAsync(int categoryId, CategoryType expectedType)
    {
        var category = await db.Categories.FindAsync(categoryId)
            ?? throw AppException.NotFound($"Category {categoryId} not found.");

        if (category.Type != expectedType)
            throw AppException.Unprocessable(
                $"Category '{category.Name}' is a {category.Type} category and cannot be used for a {expectedType} transaction.");
    }

    private async Task<TransactionResponse> ToResponseAsync(Transaction t)
    {
        await db.Entry(t).Reference(x => x.Category).LoadAsync();
        return TransactionResponse.From(t);
    }

    private static DateTime? ComputeNextOccurrence(RecurringInterval interval) => interval switch
    {
        RecurringInterval.Daily    => DateTime.UtcNow.AddDays(1),
        RecurringInterval.Weekly   => DateTime.UtcNow.AddDays(7),
        RecurringInterval.Monthly  => DateTime.UtcNow.AddMonths(1),
        RecurringInterval.Annually => DateTime.UtcNow.AddYears(1),
        _                          => null
    };
}
