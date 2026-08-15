# Member Dashboard for Umbraco

[![NuGet](https://img.shields.io/nuget/v/Umbraco.Community.MemberDashboard.svg)](https://www.nuget.org/packages/Umbraco.Community.MemberDashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A backoffice dashboard for managing an Umbraco member base at scale.

![The Member Dashboard listing members with group, status, last login and created columns, above filters for group, approval and lockout](https://raw.githubusercontent.com/mrflo/MemberDashboard/main/docs/member-dashboard.png)

Umbraco 18 ships a Members section with a tree and a per-member editor, but no way to *manage* members
in bulk. There is no group filter, no approval or lockout filter, and no multi-select. Unlocking forty
members after a brute-force lockout means opening forty members.

This package adds a Member Dashboard to the Members section:

- **Filter** by member group, approval status and lockout status, plus free-text search across name,
  email and username.
- **Sort** by name, username, email, last login or created date — all server-side.
- **Page** through the full member base.
- **Bulk unlock, approve, unapprove and delete** any selection, in a single request.
- **Edit a member** in a panel that slides in from the right, without leaving the list.
- Newest members first by default, so you land on who just signed up.

It is built on Umbraco's own collection framework, so the toolbar, pagination, selection bar, sorting
and empty states are the standard backoffice components and behave exactly as they do elsewhere.

## Requirements

| | |
|---|---|
| Umbraco | 18.x |
| .NET | 10.0 |

## Installation

```bash
dotnet add package Umbraco.Community.MemberDashboard
```

That is all — the dashboard registers itself. Open the **Members** section and it is the first tab.

Access follows Umbraco's own rule: the API is guarded by `SectionAccessMembers`, so any user who can
reach the Members section can use the dashboard, and nobody else can.

## How it works

Reading the member list uses Umbraco's built-in `GET /umbraco/management/api/v1/filter/member`
endpoint, which already supports group, approval, lockout, ordering and paging parameters — Umbraco's
own member list simply does not send them. No custom read API is involved.

The package adds two server endpoints, both because the Management API cannot express what the
dashboard needs.

`POST /umbraco/member-dashboard/api/v1/bulk` — bulk operations:

- It turns a 200-member unlock into one request instead of 200.
- Unlocking properly means clearing `IsLockedOut` **and** resetting `FailedPasswordAttempts`. The
  Management API's member update model has no `failedPasswordAttempts` field, so a correct unlock is
  only reachable server-side.
- Members are processed independently and the response reports exactly which ones failed and why, so
  a partial failure is visible instead of silent.

`POST /umbraco/member-dashboard/api/v1/details` — the Groups and Created columns:

- `filter/member` returns every member with an empty group list and a default creation date of
  `0001-01-01`, so neither column can be populated from the listing response.
- The only Management API alternative is the per-member detail endpoint, which would be one request
  per row. This endpoint takes a whole page of member keys and answers in one.

## Repository layout

```
src/Umbraco.Community.MemberDashboard/   The package (Razor Class Library + TypeScript client)
  Client/                                Lit/TypeScript backoffice extension
  Controllers/ Services/ ViewModels/     The bulk and details endpoints
demo/MemberDashboard.Demo/               Umbraco 18 site for development, seeds 60 demo members
docs/                                    Screenshots used by this README
```

## Building from source

Requires the .NET 10 SDK and **Node 24+** (see `.nvmrc`).

```bash
git clone https://github.com/mrflo/MemberDashboard.git
cd MemberDashboard
dotnet build
dotnet run --project demo/MemberDashboard.Demo
```

`dotnet build` runs `npm install` and `npm run build` for the client automatically, so there is no
separate front-end step. Pass `-p:SkipClientBuild=true` to skip it.

The demo site installs unattended with SQLite and seeds 60 members across three groups, with some
awaiting approval and some locked out, so every filter and bulk action has something to act on.

### Demo site login

The demo site installs itself with a fixed local administrator, configured in
`demo/MemberDashboard.Demo/appsettings.Development.json`:

| | |
|---|---|
| Backoffice | <https://localhost:44381/umbraco> |
| Email | `admin@memberdashboard.local` |
| Password | `MemberDash1234!` |

These credentials exist only for this throwaway local development database. They are not a secret and
must never be reused anywhere else. To start from a clean database, delete
`demo/MemberDashboard.Demo/umbraco/Data` and run the site again — it reinstalls and reseeds.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development loop.

## Contributing

Contributions are welcome — issues, bug reports and pull requests alike. Please read
[CONTRIBUTING.md](CONTRIBUTING.md) first, and note that this project ships a
[Code of Conduct](CODE_OF_CONDUCT.md).

## Licence

[MIT](LICENSE).
