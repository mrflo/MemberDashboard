# Contributing

Thanks for considering a contribution. Issues, bug reports, documentation fixes and pull requests are
all welcome.

## Getting set up

You need:

- .NET SDK 10.0+
- Node 24+ — the repo has an `.nvmrc`, so `nvm use` picks the right version

```bash
git clone https://github.com/mrflo/MemberDashboard.git
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

- **The listing itself needs no server code.** Umbraco's built-in `filter/member` endpoint already
  accepts `memberGroupName`, `isApproved`, `isLockedOut`, `orderBy` and `orderDirection`; the core
  member collection just never sends them. `member-dashboard-collection.server.data-source.ts` is
  where we do.
- **Never use raw `fetch()`** for backoffice APIs — it produces 401s. Use the generated client from
  `src/api`, wrapped in `tryExecute` from `@umbraco-cms/backoffice/resources`.
- **`src/api` is generated and committed.** Do not hand-edit it. Regenerate with
  `npm run generate-client` against a running demo site, and commit the result so CI and `dotnet build`
  work without a live instance.
- **`filter/member` lies about two fields.** It returns every member with `groups: []` and a
  `createDate` of `0001-01-01`, whatever is actually stored. Both come from this package's own
  `POST /details` instead, merged into the item model by the collection data source — so by the time
  the table sees a member, `groups` holds group *names*, not keys.
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

## Releasing

One package ID serves two Umbraco majors, so **the package major mirrors the Umbraco major**:

| Branch | Builds against | Tags | Publishes |
|---|---|---|---|
| `v17/dev` | Umbraco 17 LTS | `v17.x.y` | `17.x.y` |
| `v18/dev` | Umbraco 18 | `v18.x.y` | `18.x.y` |

`main` holds whatever is current for the README and the Marketplace manifest; releases are tagged on
the dev branches.

Two things keep the two lines from colliding:

- **Bounded dependency ranges.** `Directory.Packages.props` pins the Umbraco packages to
  `[17.x, 18.0.0)` / `[18.x, 19.0.0)` rather than a bare minimum. An unbounded `18.1.0` means
  ">= 18.1.0 forever", which would let NuGet install the v18 build on an Umbraco 19 site and would
  make the Marketplace advertise Umbraco versions that were never tested.
- **A guard in the workflow.** It reads the Umbraco major out of `Directory.Packages.props` and
  refuses to publish if it disagrees with the tag. Tagging `v18.0.0` on `v17/dev` fails the build
  instead of shipping v17 code as 18.x — which could not be undone, since NuGet versions are
  permanent.

Publishing is automated by `.github/workflows/publish.yml` and happens on tag push:

```bash
# Move the CHANGELOG's "Unreleased" entries under the new version first, then:
git checkout v18/dev
git tag v18.0.0
git push origin v18.0.0
```

The workflow packs with `-p:Version` taken from the tag, so the csproj's `<Version>` is not the
source of truth for a release — the tag is. It can also be run manually from the Actions tab with an
explicit version.

A change that applies to both lines is committed on one dev branch and cherry-picked onto the other.
Keep `Directory.Packages.props` and `Client/package.json` out of such a cherry-pick: those are the
files that legitimately differ between the two.

There is no NuGet API key anywhere. The workflow uses
[Trusted Publishing](https://learn.microsoft.com/en-us/nuget/nuget-org/trusted-publishing): it
exchanges a GitHub OIDC token for an API key that is valid for one hour and usable once. Two things
have to be set up for that to work:

- A **Trusted Publishing policy** on nuget.org (your username → Trusted Publishing), naming
  Repository Owner `mrflo`, Repository `MemberDashboard`, and Workflow File `publish.yml` — the file
  name only, not the path. Leave Environment blank.
- A repository secret **`NUGET_USER`** holding your nuget.org username — the profile name, not your
  email address.

A newly created policy on a private repository stays provisional for 7 days: if nothing publishes in
that window it goes inactive, and you restart the window from the same page. The first successful
publish makes it permanent.

## Reporting bugs

Please include the Umbraco version, the package version, what you expected, what happened, and any
browser console or server log output. A reproduction against the demo site is the most useful thing
you can provide.
