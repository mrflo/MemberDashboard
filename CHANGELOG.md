# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-08-15

### Added

- A package icon, which is also what the Umbraco Marketplace uses as the listing image.
- `umbraco-marketplace.json`, setting the Marketplace category, screenshots and links.

## [0.1.0] - 2026-08-15

### Added

- Member Dashboard in the Members section, listing members in Umbraco's standard collection table
  with server-side paging and sorting by name, username, email, last login and created date.
- Filtering by member group, approval status and lockout status, alongside the built-in free-text
  search across name, email and username.
- Newest-members-first as the default ordering.
- Multi-select with bulk unlock, approve, unapprove and delete. Each runs as a single request to
  `POST /umbraco/member-dashboard/api/v1/bulk` and reports partial failures rather than hiding them.
  Unlock also resets the failed login attempt counter, which the Management API cannot do.
- A Groups column and a Created column, both backed by
  `POST /umbraco/member-dashboard/api/v1/details`. The Management API's `filter/member` endpoint
  returns every member with an empty group list and a default creation date, so these two columns
  cannot be populated from the listing response alone.
- A right-hand sidebar panel for editing a member's name, email, username, password, groups and
  approval/lockout/two-factor state, with a link out to the full member workspace.
- English localization for all user-facing strings.

[Unreleased]: https://github.com/mrflo/MemberDashboard/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/mrflo/MemberDashboard/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/mrflo/MemberDashboard/releases/tag/v0.1.0
