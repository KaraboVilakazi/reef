using System.ComponentModel.DataAnnotations;
using Reef.API.Domain.Enums;

namespace Reef.API.DTOs.Account;

public record CreateAccountRequest(
    [Required] string      Name,
    [Required] AccountType AccountType
);
