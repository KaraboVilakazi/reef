using System.Net;

namespace Reef.API.Common.Exceptions;

// Same pattern as Imali/SwiftCart — carry the HTTP status inside the exception
// so the middleware can map it without a giant if/else chain.
public class AppException(string message, HttpStatusCode status = HttpStatusCode.BadRequest)
    : Exception(message)
{
    public HttpStatusCode Status { get; } = status;

    public static AppException NotFound(string message)      => new(message, HttpStatusCode.NotFound);
    public static AppException Conflict(string message)      => new(message, HttpStatusCode.Conflict);
    public static AppException Forbidden(string message)     => new(message, HttpStatusCode.Forbidden);
    public static AppException Unauthorized(string message)  => new(message, HttpStatusCode.Unauthorized);
    public static AppException Unprocessable(string message) => new(message, HttpStatusCode.UnprocessableEntity);
}
