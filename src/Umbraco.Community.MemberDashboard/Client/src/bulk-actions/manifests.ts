import {
  MEMBER_DASHBOARD_BULK_APPROVE_ALIAS,
  MEMBER_DASHBOARD_BULK_DELETE_ALIAS,
  MEMBER_DASHBOARD_BULK_UNAPPROVE_ALIAS,
  MEMBER_DASHBOARD_BULK_UNLOCK_ALIAS,
  MEMBER_DASHBOARD_COLLECTION_ALIAS,
} from "../constants.js";

/**
 * Bulk actions render into `umb-collection-selection-actions`, which the default collection element
 * already puts in the footer — they appear as soon as rows are selected, with no extra UI from us.
 *
 * Ordered by how routine they are: unlock and approve are the everyday operations, the destructive
 * ones sit at the end.
 */
const collectionCondition = {
  alias: "Umb.Condition.CollectionAlias",
  match: MEMBER_DASHBOARD_COLLECTION_ALIAS,
};

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "entityBulkAction",
    alias: MEMBER_DASHBOARD_BULK_UNLOCK_ALIAS,
    name: "Member Dashboard Bulk Unlock",
    weight: 400,
    api: () => import("./unlock.action.js"),
    meta: {
      icon: "icon-unlocked",
      label: "#memberDashboard_bulkUnlock",
    },
    conditions: [collectionCondition],
  },
  {
    type: "entityBulkAction",
    alias: MEMBER_DASHBOARD_BULK_APPROVE_ALIAS,
    name: "Member Dashboard Bulk Approve",
    weight: 300,
    api: () => import("./approve.action.js"),
    meta: {
      icon: "icon-check",
      label: "#memberDashboard_bulkApprove",
    },
    conditions: [collectionCondition],
  },
  {
    type: "entityBulkAction",
    alias: MEMBER_DASHBOARD_BULK_UNAPPROVE_ALIAS,
    name: "Member Dashboard Bulk Unapprove",
    weight: 200,
    api: () => import("./unapprove.action.js"),
    meta: {
      icon: "icon-block",
      label: "#memberDashboard_bulkUnapprove",
    },
    conditions: [collectionCondition],
  },
  {
    type: "entityBulkAction",
    alias: MEMBER_DASHBOARD_BULK_DELETE_ALIAS,
    name: "Member Dashboard Bulk Delete",
    weight: 100,
    api: () => import("./delete.action.js"),
    meta: {
      icon: "icon-trash",
      label: "#memberDashboard_bulkDelete",
    },
    conditions: [collectionCondition],
  },
];
