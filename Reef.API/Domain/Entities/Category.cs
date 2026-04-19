using Reef.API.Domain.Enums;

namespace Reef.API.Domain.Entities;

public class Category
{
    public int  Id   { get; set; }  // int PK — will be seeded, not user-generated

    public required string       Name     { get; set; }
    public required CategoryType Type     { get; set; }

    // System categories are seeded by the app and cannot be deleted.
    // User-created categories have IsSystem = false.
    public bool IsSystem { get; set; } = false;

    public ICollection<Transaction> Transactions { get; set; } = [];
    public ICollection<Budget>      Budgets      { get; set; } = [];
}
