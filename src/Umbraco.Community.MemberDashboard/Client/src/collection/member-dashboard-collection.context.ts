import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbDefaultCollectionContext } from "@umbraco-cms/backoffice/collection";
import { MEMBER_DASHBOARD_TABLE_VIEW_ALIAS } from "../constants.js";
import type {
  UmbMemberDashboardCollectionFilterModel,
  UmbMemberDashboardCollectionItemModel,
} from "./types.js";

const DEFAULT_PAGE_SIZE = 50;

/**
 * Collection context for the member dashboard.
 *
 * Defaults to newest members first — the dashboard's job is to surface who just signed up, so
 * "latest first" is the useful landing state rather than Umbraco's alphabetical-by-username default.
 */
export class UmbMemberDashboardCollectionContext extends UmbDefaultCollectionContext<
  UmbMemberDashboardCollectionItemModel,
  UmbMemberDashboardCollectionFilterModel
> {
  constructor(host: UmbControllerHost) {
    super(host, MEMBER_DASHBOARD_TABLE_VIEW_ALIAS, {
      orderBy: "createDate",
      orderDirection: "Descending",
      take: DEFAULT_PAGE_SIZE,
    });

    this.setConfig({
      pageSize: DEFAULT_PAGE_SIZE,
      selectionConfiguration: {
        selectable: true,
        multiple: true,
      },
      bulkActionConfiguration: {
        enabled: true,
      },
    });
  }

  /**
   * Applies a filter change and returns to the first page.
   *
   * Narrowing a filter while on, say, page 5 would otherwise ask the server to skip past the end
   * of the new result set and show an empty table. `setFilter` alone does not touch pagination, so
   * the page number is reset here too — otherwise the pagination control would keep showing "5".
   */
  applyFilter(filter: Partial<UmbMemberDashboardCollectionFilterModel>) {
    this.pagination.setCurrentPageNumber(1);
    this.setFilter({ ...filter, skip: 0 });
  }

  /**
   * Clears every filter back to the dashboard's landing state.
   *
   * `setFilter` merges rather than replaces, so each removable filter has to be explicitly
   * set back to undefined — omitting a key would leave the previous value in place.
   */
  resetFilter() {
    this.applyFilter({
      filter: undefined,
      memberGroupName: undefined,
      isApproved: undefined,
      isLockedOut: undefined,
      orderBy: "createDate",
      orderDirection: "Descending",
    });
  }
}

export { UmbMemberDashboardCollectionContext as api };
export default UmbMemberDashboardCollectionContext;
