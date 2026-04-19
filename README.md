# Reef 💰

A personal finance platform built with **.NET 8** and **Angular 19**, featuring real-time balance monitoring via SignalR WebSockets.

## Stack

| Layer | Tech |
|---|---|
| API | C# · .NET 8 Web API |
| Frontend | Angular 19 · TypeScript |
| Database | PostgreSQL · Entity Framework Core 8 |
| Real-time | SignalR |
| Auth | JWT Bearer · BCrypt |
| Migrations | EF Core Migrations |

## Features

- **Multi-account management** — create and manage multiple accounts (Cheque, Savings, etc.)
- **Transaction tracking** — deposits, withdrawals, transfers with full history
- **Budget engine** — set monthly budgets per category with burn-rate analytics
- **Real-time updates** — SignalR hub pushes live balance changes to connected clients
- **JWT authentication** — secure login/register with role-based access control
- **Swagger UI** — full API documentation at `/swagger`

## Project Structure

```
reef/
├── Reef.API/          # .NET 8 Web API
│   ├── Controllers/       # Auth, Account, Transaction, Budget
│   ├── Services/          # Business logic layer
│   ├── Domain/            # Entities & enums
│   ├── DTOs/              # Request/response models
│   ├── Hubs/              # SignalR FinanceHub
│   ├── Data/              # EF Core DbContext
│   └── Migrations/        # Database migrations
│
└── reef-ui/           # Angular 19 frontend
    └── src/app/
        ├── core/          # Services, models, guards, interceptors
        └── features/      # Dashboard, Accounts, Transactions, Budgets, Auth
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- PostgreSQL

### API

```bash
cd Reef.API

# Update connection string in appsettings.json
# then run migrations
dotnet ef database update

dotnet run
# API runs on https://localhost:5001
# Swagger at https://localhost:5001/swagger
```

### Frontend

```bash
cd reef-ui
npm install
ng serve
# Runs on http://localhost:4200
```

## Mobile

The companion React Native app is at [reef-mobile](https://github.com/KaraboVilakazi/reef-mobile).
