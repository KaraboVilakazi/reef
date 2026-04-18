using System.ComponentModel.DataAnnotations;

namespace Reef.API.DTOs.Transaction;

public record DepositRequest(
    [Required]                      Guid    AccountId,
    [Required, Range(0.01, double.MaxValue)] decimal Amount,
    [Required]                      int     CategoryId,
    [Required]                      string  Description,
    int RecurringInterval = 0  // maps to RecurringInterval enum — 0 = None
);
