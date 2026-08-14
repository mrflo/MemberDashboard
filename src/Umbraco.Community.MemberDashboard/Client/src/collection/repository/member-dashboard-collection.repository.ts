import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import type { UmbCollectionRepository } from "@umbraco-cms/backoffice/collection";
import { UmbRepositoryBase } from "@umbraco-cms/backoffice/repository";
import { UmbMemberDashboardCollectionServerDataSource } from "./member-dashboard-collection.server.data-source.js";
import type { UmbMemberDashboardCollectionFilterModel } from "../types.js";

export class UmbMemberDashboardCollectionRepository
  extends UmbRepositoryBase
  implements UmbCollectionRepository
{
  #dataSource: UmbMemberDashboardCollectionServerDataSource;

  constructor(host: UmbControllerHost) {
    super(host);
    this.#dataSource = new UmbMemberDashboardCollectionServerDataSource(host);
  }

  async requestCollection(filter: UmbMemberDashboardCollectionFilterModel) {
    return this.#dataSource.getCollection(filter);
  }
}

export default UmbMemberDashboardCollectionRepository;
