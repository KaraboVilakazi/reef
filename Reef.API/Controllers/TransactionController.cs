using System.Security.Claims;
using Reef.API.DTOs.Transaction;
using Reef.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Reef.API.Controllers;

[ApiController]
[Route("api/v1/transactions")]
[Authorize]
public class TransactionController(TransactionService transactionService) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("deposit")]
    public async Task<IActionResult> Deposit([FromBody] DepositRequest request)
    {
        var result = await transactionService.DepositAsync(UserId, request);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("withdraw")]
    public async Task<IActionResult> Withdraw([FromBody] WithdrawRequest request)
    {
        var result = await transactionService.WithdrawAsync(UserId, request);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer([FromBody] TransferRequest request)
    {
        var result = await transactionService.TransferAsync(UserId, request);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("account/{accountId:guid}")]
    public async Task<IActionResult> GetTransactions(
        Guid accountId,
        [FromQuery] int page = 0,
        [FromQuery] int size = 20)
    {
        var transactions = await transactionService.GetTransactionsAsync(UserId, accountId, page, size);
        return Ok(new { success = true, data = transactions });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetMonthlySummary(
        [FromQuery] int month = 0,
        [FromQuery] int year  = 0)
    {
        // Default to current month/year if not specified
        var now = DateTime.UtcNow;
        var result = await transactionService.GetMonthlySummaryAsync(
            UserId,
            month == 0 ? now.Month : month,
            year  == 0 ? now.Year  : year);

        return Ok(new { success = true, data = result });
    }
}
