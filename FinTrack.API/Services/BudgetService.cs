using Reef.API.Common.Exceptions;
using Reef.API.Data;
using Reef.API.Domain.Entities;
using Reef.API.Domain.Enums;
using Reef.API.DTOs.Budget;
using Microsoft.EntityFrameworkCore;

namespace Reef.API.Services;

public class BudgetService(ReefDbContext db)
{
    public async Task<BudgetResponse> SetBudgetAsync(Guid userId, SetBudgetRequest request)
    {
        var category = await db.Categories.FindAsync(request.CategoryId)
            ?? throw AppException.NotFound($"Category {request.CategoryId} not found.");

        if (category.Type != CategoryType.Expense)
            throw AppException.Unprocessable("Budgets can only be set for expense categories.");

        // Upsert — update if exists, create if not.
        // This is a common pattern in EF: FirstOrDefault + conditional Add.
        var budget = await db.Budgets.FirstOrDefaultAsync(b =>
            b.UserId     == userId          &&
            b.CategoryId == request.CategoryId &&
            b.Month      == request.Month   &&
            b.Year       == request.Year);

        if (budget is null)
        {
            budget = new Budget
            {
                UserId      = userId,
                CategoryId  = request.CategoryId,
                Month       = request.Month,
                Year        = request.Year,
                LimitAmount = request.LimitAmount
            };
            db.Budgets.Add(budget);
        }
        else
        {
            budget.LimitAmount = request.LimitAmount;
        }

        await db.SaveChangesAsync();

        return await BuildResponseAsync(budget, userId);
    }

    public async Task<List<BudgetResponse>> GetBudgetsAsync(Guid userId, int month, int year)
    {
        var budgets = await db.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
            .ToListAsync();

        var responses = new List<BudgetResponse>();
        foreach (var budget in budgets)
            responses.Add(await BuildResponseAsync(budget, userId));

        return responses;
    }

    // ── Core logic ──────────────────────────────────────────────────────────

    private async Task<BudgetResponse> BuildResponseAsync(Budget budget, Guid userId)
    {
        // Compute actual spend from the immutable transaction log
        var actualSpend = await db.Transactions
            .Where(t =>
                t.Account.UserId         == userId              &&
                t.CategoryId             == budget.CategoryId   &&
                t.Type                   == TransactionType.Expense &&
                t.TransactionDate.Month  == budget.Month        &&
                t.TransactionDate.Year   == budget.Year)
            .SumAsync(t => t.Amount);

        // Burn rate projection:
        // How much will we spend by end of month if we keep up the current daily rate?
        //
        // burnRate = (actualSpend / daysPassed) * daysInMonth
        //
        // Example: R800 spent in first 10 days of a 30-day month
        //   → daily rate = R80/day → projected = R80 * 30 = R2,400
        var today       = DateTime.UtcNow;
        var daysPassed  = today.Day;
        var daysInMonth = DateTime.DaysInMonth(budget.Year, budget.Month);

        var burnRate = daysPassed > 0
            ? (actualSpend / daysPassed) * daysInMonth
            : 0m;

        var categoryName = budget.Category?.Name
            ?? (await db.Categories.FindAsync(budget.CategoryId))!.Name;

        return new BudgetResponse(
            Id:                    budget.Id,
            Category:              categoryName,
            LimitAmount:           budget.LimitAmount,
            ActualSpend:           actualSpend,
            RemainingAmount:       budget.LimitAmount - actualSpend,
            BurnRate:              Math.Round(burnRate, 2),
            IsOverBudget:          actualSpend > budget.LimitAmount,
            IsProjectedToOverrun:  burnRate > budget.LimitAmount,
            Month:                 budget.Month,
            Year:                  budget.Year
        );
    }
}
