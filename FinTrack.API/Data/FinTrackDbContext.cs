using Reef.API.Domain.Entities;
using Reef.API.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Reef.API.Data;

// DbContext is EF Core's unit of work + repository combined.
// Think of it as Spring's EntityManager, but with DbSet<T> properties
// instead of @Repository interfaces. EF generates SQL from LINQ queries.
public class ReefDbContext(DbContextOptions<ReefDbContext> options) : DbContext(options)
{
    public DbSet<User>        Users        => Set<User>();
    public DbSet<Account>     Accounts     => Set<Account>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category>    Categories   => Set<Category>();
    public DbSet<Budget>      Budgets      => Set<Budget>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── User ────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ── Account ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Account>(e =>
        {
            e.Property(a => a.Balance).HasPrecision(18, 2);
            e.Property(a => a.AccountType).HasConversion<string>();  // store as "Cheque" not 0
        });

        // ── Transaction ─────────────────────────────────────────────────────
        modelBuilder.Entity<Transaction>(e =>
        {
            e.Property(t => t.Amount).HasPrecision(18, 2);
            e.Property(t => t.BalanceAfter).HasPrecision(18, 2);
            e.Property(t => t.Type).HasConversion<string>();
            e.Property(t => t.RecurringInterval).HasConversion<string>();

            // Self-referential FK for transfer destination — optional, no cascade
            e.HasOne<Account>()
             .WithMany()
             .HasForeignKey(t => t.DestinationAccountId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Budget ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Budget>(e =>
        {
            e.Property(b => b.LimitAmount).HasPrecision(18, 2);

            // One budget per category per month per user
            e.HasIndex(b => new { b.UserId, b.CategoryId, b.Month, b.Year }).IsUnique();
        });

        // ── Seed Categories ─────────────────────────────────────────────────
        // HasData seeds rows on every migration. IDs are stable ints so EF
        // can detect changes — Guid PKs don't work well with HasData.
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1,  Name = "Salary",        Type = CategoryType.Income,  IsSystem = true },
            new Category { Id = 2,  Name = "Freelance",     Type = CategoryType.Income,  IsSystem = true },
            new Category { Id = 3,  Name = "Investment",    Type = CategoryType.Income,  IsSystem = true },
            new Category { Id = 4,  Name = "Groceries",     Type = CategoryType.Expense, IsSystem = true },
            new Category { Id = 5,  Name = "Transport",     Type = CategoryType.Expense, IsSystem = true },
            new Category { Id = 6,  Name = "Rent",          Type = CategoryType.Expense, IsSystem = true },
            new Category { Id = 7,  Name = "Utilities",     Type = CategoryType.Expense, IsSystem = true },
            new Category { Id = 8,  Name = "Entertainment", Type = CategoryType.Expense, IsSystem = true },
            new Category { Id = 9,  Name = "Healthcare",    Type = CategoryType.Expense, IsSystem = true },
            new Category { Id = 10, Name = "Education",     Type = CategoryType.Expense, IsSystem = true },
            new Category { Id = 11, Name = "Clothing",      Type = CategoryType.Expense, IsSystem = true },
            new Category { Id = 12, Name = "Other",         Type = CategoryType.Expense, IsSystem = true }
        );
    }
}
