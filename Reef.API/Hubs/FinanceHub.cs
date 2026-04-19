using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Reef.API.Hubs;

// SignalR Hub — the server-side half of the real-time connection.
// Angular connects via @microsoft/signalr and subscribes to events.
//
// [Authorize] means the hub requires a valid JWT — same as [Authorize]
// on a controller. The JWT is passed in the query string by the SignalR
// client because WebSocket handshakes can't set Authorization headers.
[Authorize]
public class FinanceHub : Hub
{
    // Called when a client connects. We add them to a group keyed by
    // their userId so we can push targeted updates via hub.Clients.User().
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId is not null)
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);

        await base.OnConnectedAsync();
    }

    // Clients call this to subscribe to a specific account's balance updates.
    // Useful when the dashboard has multiple accounts open simultaneously.
    public async Task SubscribeToAccount(string accountId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"account:{accountId}");
    }

    public async Task UnsubscribeFromAccount(string accountId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"account:{accountId}");
    }
}
