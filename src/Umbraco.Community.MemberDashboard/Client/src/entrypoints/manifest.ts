export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Member Dashboard Entrypoint",
    alias: "MemberDashboard.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
