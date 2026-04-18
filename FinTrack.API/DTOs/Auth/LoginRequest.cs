using System.ComponentModel.DataAnnotations;

namespace Reef.API.DTOs.Auth;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required]               string Password
);
