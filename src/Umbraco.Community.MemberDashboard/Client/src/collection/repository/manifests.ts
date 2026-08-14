import { MEMBER_DASHBOARD_COLLECTION_REPOSITORY_ALIAS } from "../../constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "repository",
    alias: MEMBER_DASHBOARD_COLLECTION_REPOSITORY_ALIAS,
    name: "Member Dashboard Collection Repository",
    api: () => import("./member-dashboard-collection.repository.js"),
  },
];
