import { MEMBER_DASHBOARD_ALIAS } from "../constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "dashboard",
    alias: MEMBER_DASHBOARD_ALIAS,
    name: "Member Dashboard",
    js: () => import("./member-dashboard.element.js"),
    // Ahead of Umbraco's own member dashboards, so managing members is the landing view.
    weight: 500,
    meta: {
      label: "#memberDashboard_dashboardLabel",
      pathname: "member-dashboard",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Members",
      },
    ],
  },
];
