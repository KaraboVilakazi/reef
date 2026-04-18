using System.ComponentModel.DataAnnotations;

namespace Reef.API.DTOs.Budget;

public record SetBudgetRequest(
    [Required]                               int     CategoryId,
    [Required, Range(0.01, double.MaxValue)] decimal LimitAmount,
    [Required, Range(1, 12)]                 int     Month,
    [Required, Range(2024, 2100)]            int     Year
);
