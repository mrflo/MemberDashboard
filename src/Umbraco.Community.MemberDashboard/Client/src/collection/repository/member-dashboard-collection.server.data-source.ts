import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import type { UmbCollectionDataSource } from "@umbraco-cms/backoffice/collection";
import { UMB_MEMBER_ENTITY_TYPE } from "@umbraco-cms/backoffice/member";
import { DirectionModel, MemberService } from "@umbraco-cms/backoffice/external/backend-api";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import type {
  UmbMemberDashboardCollectionFilterModel,
  UmbMemberDashboardCollectionItemModel,
} from "../types.js";

/**
 * Reads the member collection from Umbraco's built-in `filter/member` endpoint.
 *
 * We deliberately do not reuse `UmbMemberCollectionRepository`: its filter model omits
 * `memberGroupName`, `isApproved` and `isLockedOut`, so it cannot express the filters this
 * dashboard exists to provide — even though the endpoint behind it accepts them.
 */
export class UmbMemberDashboardCollectionServerDataSource
  implements UmbCollectionDataSource<UmbMemberDashboardCollectionItemModel>
{
  #host: UmbControllerHost;

  constructor(host: UmbControllerHost) {
    this.#host = host;
  }

  async getCollection(filter: UmbMemberDashboardCollectionFilterModel) {
    const { data, error } = await tryExecute(
      this.#host,
      MemberService.getFilterMember({
        query: {
          memberTypeId: filter.memberTypeId,
          memberGroupName: filter.memberGroupName,
          isApproved: filter.isApproved,
          isLockedOut: filter.isLockedOut,
          filter: filter.filter,
          orderBy: filter.orderBy ?? "createDate",
          orderDirection:
            filter.orderDirection === "Ascending"
              ? DirectionModel.ASCENDING
              : DirectionModel.DESCENDING,
          skip: filter.skip ?? 0,
          take: filter.take ?? 50,
        },
      }),
    );

    if (error) {
      return { error };
    }

    if (!data) {
      return { data: { items: [], total: 0 } };
    }

    const items: Array<UmbMemberDashboardCollectionItemModel> = data.items.map((item) => {
      // Members are invariant, so there is exactly one variant carrying the name and dates.
      const variant = item.variants?.[0];

      return {
        unique: item.id,
        entityType: UMB_MEMBER_ENTITY_TYPE,
        name: variant?.name || item.username,
        email: item.email,
        username: item.username,
        groups: item.groups ?? [],
        isApproved: item.isApproved,
        isLockedOut: item.isLockedOut,
        isTwoFactorEnabled: item.isTwoFactorEnabled,
        failedPasswordAttempts: item.failedPasswordAttempts,
        lastLoginDate: item.lastLoginDate ?? null,
        lastLockoutDate: item.lastLockoutDate ?? null,
        createDate: variant?.createDate ?? null,
        memberTypeIcon: item.memberType?.icon ?? null,
      };
    });

    return { data: { items, total: data.total } };
  }
}
