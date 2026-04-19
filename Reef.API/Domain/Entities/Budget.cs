namespace Reef.API.Domain.Entities;

// A budget is a monthly spend limit for a specific category.
// The service layer computes ActualSpend and BurnRate dynamically
// from the transaction log — we never store a mutable "spent so far" field
// because that would go out of sync if a transaction is voided.
public class Budget
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User   { get; set; } = null!;

    public int      CategoryId { get; set; }
    public Category Category   { get; set; } = null!;

    public required decimal LimitAmount { get; set; }

    // Which month/year this budget applies to
    public required int Month { get; set; }   // 1–12
    public required int Year  { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
