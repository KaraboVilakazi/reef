using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Reef.API.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Reef.API.Services;

// C# JWT works the same way as JJWT in Java — sign a claims set with a secret key.
// The main difference: .NET has built-in System.IdentityModel.Tokens.Jwt,
// no third-party library needed beyond the JwtBearer NuGet package.
public class JwtService(IConfiguration config)
{
    private readonly string _secret     = config["Jwt:Secret"]!;
    private readonly int    _expiryDays = int.Parse(config["Jwt:ExpiryDays"] ?? "1");

    public string GenerateToken(User user)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Claims are the payload — same concept as JWT claims in JJWT
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email),
            new Claim(ClaimTypes.GivenName,      user.FirstName)
        };

        var token = new JwtSecurityToken(
            issuer:             config["Jwt:Issuer"],
            audience:           config["Jwt:Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddDays(_expiryDays),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
