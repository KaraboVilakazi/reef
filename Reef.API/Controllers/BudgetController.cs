using System.Security.Claims;
using Reef.API.DTOs.Budget;
using Reef.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Reef.API.Controllers;

[ApiController]
[Route("api/v1/budgets")]
[Authorize]
public class BudgetController(BudgetService budgetService) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> SetBudget([FromBody] SetBudgetRequest request)
    {
        var result = await budgetService.SetBudgetAsync(UserId, request);
        return Ok(new { success = true, data = result });
    }

    [HttpGet]
    public async Task<IActionResult> GetBudgets(
        [FromQuery] int month = 0,
        [FromQuery] int year  = 0)
    {
        var now  = DateTime.UtcNow;
        var list = await budgetService.GetBudgetsAsync(
            UserId,
            month == 0 ? now.Month : month,
            year  == 0 ? now.Year  : year);

        return Ok(new { success = true, data = list });
    }
}
