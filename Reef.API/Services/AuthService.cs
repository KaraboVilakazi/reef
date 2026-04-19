using Reef.API.Common.Exceptions;
using Reef.API.Data;
using Reef.API.Domain.Entities;
using Reef.API.DTOs.Auth;
using Microsoft.EntityFrameworkCore;

namespace Reef.API.Services;

public class AuthService(ReefDbContext db, JwtService jwt)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email))
            throw AppException.Conflict("An account with this email already exists.");

        var user = new User
        {
            Email        = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName    = request.FirstName,
            LastName     = request.LastName
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return new AuthResponse(jwt.GenerateToken(user), user.Email, user.FirstName, user.LastName);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant())
            ?? throw AppException.Unauthorized("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw AppException.Unauthorized("Invalid email or password.");

        return new AuthResponse(jwt.GenerateToken(user), user.Email, user.FirstName, user.LastName);
    }
}
