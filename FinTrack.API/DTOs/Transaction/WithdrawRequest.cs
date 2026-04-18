using System.ComponentModel.DataAnnotations;

namespace Reef.API.DTOs.Transaction;

public record WithdrawRequest(
    [Required]                               Guid    AccountId,
    [Required, Range(0.01, double.MaxValue)] decimal Amount,
    [Required]                               int     CategoryId,
    [Required]                               string  Description,
    int RecurringInterval = 0
);
