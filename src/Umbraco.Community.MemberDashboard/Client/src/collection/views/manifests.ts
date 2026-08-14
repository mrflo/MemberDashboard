import {
  MEMBER_DASHBOARD_COLLECTION_ALIAS,
  MEMBER_DASHBOARD_TABLE_VIEW_ALIAS,
} from "../../constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "collectionView",
    alias: MEMBER_DASHBOARD_TABLE_VIEW_ALIAS,
    name: "Member Dashboard Table Collection View",
    element: () => import("./table/member-dashboard-table-collection-view.element.js"),
    weight: 300,
    meta: {
      label: "Table",
      icon: "icon-list",
      pathName: "table",
    },
    conditions: [
      {
        alias: "Umb.Condition.CollectionAlias",
        match: MEMBER_DASHBOARD_COLLECTION_ALIAS,
      },
    ],
  },
];
