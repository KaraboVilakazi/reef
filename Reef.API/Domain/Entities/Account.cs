using Reef.API.Domain.Enums;

namespace Reef.API.Domain.Entities;

public class Account
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid   UserId { get; set; }
    public User   User   { get; set; } = null!;  // null! tells the compiler EF will populate this

    public required string      Name        { get; set; }
    public required AccountType AccountType { get; set; }

    // decimal is the correct type for money in C# — never float or double.
    // Same reasoning as BigDecimal in Java.
    public decimal Balance  { get; set; } = 0m;  // 'm' suffix = decimal literal
    public string  Currency { get; set; } = "ZAR";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Transaction> Transactions { get; set; } = [];
}
