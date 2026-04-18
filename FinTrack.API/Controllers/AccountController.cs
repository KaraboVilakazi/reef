using System.Security.Claims;
using Reef.API.DTOs.Account;
using Reef.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Reef.API.Controllers;

[ApiController]
[Route("api/v1/accounts")]
[Authorize]
public class AccountController(AccountService accountService) : ControllerBase
{
    // Helper to extract the userId from the JWT claims — same as getting
    // the principal in Spring Security, just different syntax.
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAccountRequest request)
    {
        var response = await accountService.CreateAccountAsync(UserId, request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, new { success = true, data = response });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var accounts = await accountService.GetAccountsAsync(UserId);
        return Ok(new { success = true, data = accounts });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var account = await accountService.GetAccountAsync(UserId, id);
        return Ok(new { success = true, data = account });
    }
}
