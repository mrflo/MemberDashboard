import type { UmbCollectionFilterModel } from "@umbraco-cms/backoffice/collection";
import type { UmbMemberEntityType } from "@umbraco-cms/backoffice/member";

/**
 * The filter this dashboard sends to `GET /umbraco/management/api/v1/filter/member`.
 *
 * The endpoint already supports every field below. Umbraco's own member collection simply never
 * sends `memberGroupName`, `isApproved` or `isLockedOut` — widening the filter here is what gives
 * the dashboard group and status filtering without any server-side code of our own.
 */
export interface UmbMemberDashboardCollectionFilterModel extends UmbCollectionFilterModel {
  /** Free-text match against name, email and username. */
  filter?: string;
  memberTypeId?: string;
  memberGroupName?: string;
  isApproved?: boolean;
  isLockedOut?: boolean;
  orderBy?: string;
  orderDirection?: "Ascending" | "Descending";
}

/**
 * One row in the dashboard table. Flattened from `MemberResponseModel` so the table view does not
 * have to dig through `variants` for the name.
 */
export interface UmbMemberDashboardCollectionItemModel {
  unique: string;
  entityType: UmbMemberEntityType;
  name: string;
  email: string;
  username: string;
  /** Group names, already resolved by the data source — not keys. */
  groups: Array<string>;
  isApproved: boolean;
  isLockedOut: boolean;
  isTwoFactorEnabled: boolean;
  failedPasswordAttempts: number;
  lastLoginDate: string | null;
  lastLockoutDate: string | null;
  createDate: string | null;
  memberTypeIcon: string | null;
}
