# Contributing

Thanks for considering a contribution. Issues, bug reports, documentation fixes and pull requests are
all welcome.

## Getting set up

You need:

- .NET SDK 10.0+
- Node 24+ — the repo has an `.nvmrc`, so `nvm use` picks the right version

```bash
git clone https://github.com/umbraco-community/MemberDashboard.git
cd MemberDashboard
nvm use
dotnet build
dotnet run --project demo/MemberDashboard.Demo
```

The demo site installs itself unattended against SQLite and seeds 60 members across three groups —
some awaiting approval, some locked out — so every filter and bulk action has data to work with. It
runs on <https://localhost:44381>. Delete `demo/MemberDashboard.Demo/umbraco/Data` to start over.

## The development loop

`dotnet build` builds the TypeScript client for you. While working on the front end, it is faster to
run Vite in watch mode in a second terminal:

```bash
cd src/Umbraco.Community.MemberDashboard/Client
npm run watch
```

Refresh the backoffice to pick up a rebuild. Useful commands:

| Command | What it does |
|---|---|
| `npm run build` | One-off production build into `wwwroot/App_Plugins/MemberDashboard` |
| `npm run watch` | Rebuild on change |
| `npm run check` | Type-check without emitting |
| `npm run generate-client` | Regenerate `src/api` from the running demo site |
| `dotnet build -p:SkipClientBuild=true` | Skip the npm build (e.g. no Node available) |

## Repository layout

```
src/Umbraco.Community.MemberDashboard/
  Client/src/
    bundle.manifests.ts     Aggregates every manifest; loaded by umbraco-package.json
    entrypoints/            Binds the generated API client to the backoffice auth context
    dashboard/              The dashboard, a thin host around <umb-collection>
    collection/             Filter model, data source, repository, context, table view, filters
    bulk-actions/           The four entityBulkAction implementations
    edit/                   The right-hand sidebar edit panel
    localization/           English strings
  Controllers/ Services/ ViewModels/   The POST /bulk endpoint
demo/MemberDashboard.Demo/             Development site and demo data seeder
```

## Things worth knowing before you change things

- **The read path deliberately has no server code.** Umbraco's built-in `filter/member` endpoint
  already accepts `memberGroupName`, `isApproved`, `isLockedOut`, `orderBy` and `orderDirection`; the
  core member collection just never sends them. `member-dashboard-collection.server.data-source.ts`
  is where we do.
- **Never use raw `fetch()`** for backoffice APIs — it produces 401s. Use the generated client from
  `src/api`, wrapped in `tryExecute` from `@umbraco-cms/backoffice/resources`.
- **`src/api` is generated and committed.** Do not hand-edit it. Regenerate with
  `npm run generate-client` against a running demo site, and commit the result so CI and `dotnet build`
  work without a live instance.
- **A member's `groups` are group keys, not names**, even though the field is typed as `string[]`.
  The table resolves them via `UmbMemberGroupItemRepository`. The `memberGroupName` *filter*, by
  contrast, really is a name — they are different spaces.
- **Bulk actions post once.** If you add an action, extend `UmbMemberBulkActionBase` and add the
  operation to `MemberBulkActionType` server-side rather than looping over per-member calls.
- **Prefer the built-in components.** The dashboard extends `UmbCollectionDefaultElement` so the
  toolbar, pagination, selection bar and empty states are Umbraco's. New UI should reach for existing
  `uui-*` / `umb-*` elements before adding custom markup.
- All user-facing strings go through `src/localization/files/en-us.ts` and `this.localize.term(...)`.

## Pull requests

- Branch from `main`.
- Keep the change focused; unrelated refactors make review harder.
- Run `dotnet build` and `npm run check` before pushing — both must be clean.
- Describe what you changed and how you verified it in the backoffice.
- Add an entry to `CHANGELOG.md` under "Unreleased".

## Reporting bugs

Please include the Umbraco version, the package version, what you expected, what happened, and any
browser console or server log output. A reproduction against the demo site is the most useful thing
you can provide.
