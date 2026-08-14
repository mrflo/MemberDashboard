import {
  MEMBER_DASHBOARD_COLLECTION_ALIAS,
  MEMBER_DASHBOARD_COLLECTION_REPOSITORY_ALIAS,
} from "../constants.js";
import { manifests as repositoryManifests } from "./repository/manifests.js";
import { manifests as viewManifests } from "./views/manifests.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "collection",
    alias: MEMBER_DASHBOARD_COLLECTION_ALIAS,
    name: "Member Dashboard Collection",
    api: () => import("./member-dashboard-collection.context.js"),
    element: () => import("./member-dashboard-collection.element.js"),
    meta: {
      repositoryAlias: MEMBER_DASHBOARD_COLLECTION_REPOSITORY_ALIAS,
    },
  },
  ...repositoryManifests,
  ...viewManifests,
];
