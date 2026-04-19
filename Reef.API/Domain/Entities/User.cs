namespace Reef.API.Domain.Entities;

// C# note: 'required' (C# 11) means the property must be set at object
// creation — the compiler enforces it. Similar to @NonNull in Java but
// checked at compile time, not runtime.
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Email        { get; set; }
    public required string PasswordHash { get; set; }
    public required string FirstName    { get; set; }
    public required string LastName     { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties — EF Core uses these to build JOINs.
    // ICollection<T> is the C# equivalent of List<T> in JPA @OneToMany.
    public ICollection<Account>  Accounts  { get; set; } = [];
    public ICollection<Budget>   Budgets   { get; set; } = [];
}
