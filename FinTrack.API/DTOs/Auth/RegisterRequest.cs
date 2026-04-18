using System.ComponentModel.DataAnnotations;

namespace Reef.API.DTOs.Auth;

// C# records are perfect for DTOs — immutable, concise, value-based equality.
// Think of them like Java records (Java 16+) but with more features.
public record RegisterRequest(
    [Required, EmailAddress]          string Email,
    [Required, MinLength(8)]          string Password,
    [Required]                        string FirstName,
    [Required]                        string LastName
);
