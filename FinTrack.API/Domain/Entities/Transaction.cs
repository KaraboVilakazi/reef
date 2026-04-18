using Reef.API.Domain.Enums;

namespace Reef.API.Domain.Entities;

// Every transaction is immutable once written — we never UPDATE a transaction row,
// only INSERT. Balance corrections happen via a new corrective transaction.
// This gives us a complete, auditable history and allows point-in-time reconstruction.
public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid    AccountId { get; set; }
    public Account Account   { get; set; } = null!;

    public int      CategoryId { get; set; }
    public Category Category   { get; set; } = null!;

    public required TransactionType Type        { get; set; }
    public required decimal         Amount      { get; set; }
    public required string          Description { get; set; }

    // Snapshot of balance immediately after this transaction committed.
    // Enables point-in-time reconstruction without replaying full history.
    public decimal BalanceAfter { get; set; }

    // For transfers: the other side of the transaction
    public Guid? DestinationAccountId { get; set; }

    // Recurring transaction support
    public RecurringInterval RecurringInterval { get; set; } = RecurringInterval.None;
    public DateTime?         NextOccurrence    { get; set; }

    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt       { get; set; } = DateTime.UtcNow;
}
