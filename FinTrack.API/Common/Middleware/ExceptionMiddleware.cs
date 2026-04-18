using System.Net;
using System.Text.Json;
using Reef.API.Common.Exceptions;

namespace Reef.API.Common.Middleware;

// In .NET, global exception handling is middleware — a function that wraps
// every request/response. Equivalent to Spring's @ControllerAdvice + @ExceptionHandler.
public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            logger.LogWarning("AppException: {Message}", ex.Message);
            await WriteError(context, (int)ex.Status, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            await WriteError(context, 500, "An unexpected error occurred.");
        }
    }

    private static Task WriteError(HttpContext context, int statusCode, string message)
    {
        context.Response.StatusCode  = statusCode;
        context.Response.ContentType = "application/json";

        var body = JsonSerializer.Serialize(new
        {
            success = false,
            message,
            statusCode
        });

        return context.Response.WriteAsync(body);
    }
}
