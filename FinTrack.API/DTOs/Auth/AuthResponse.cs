namespace Reef.API.DTOs.Auth;

public record AuthResponse(
    string Token,
    string Email,
    string FirstName,
    string LastName
);
