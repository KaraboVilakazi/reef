using System.ComponentModel.DataAnnotations;

namespace Reef.API.DTOs.Transaction;

public record TransferRequest(
    [Required]                               Guid    SourceAccountId,
    [Required]                               Guid    DestinationAccountId,
    [Required, Range(0.01, double.MaxValue)] decimal Amount,
    [Required]                               string  Description
);
