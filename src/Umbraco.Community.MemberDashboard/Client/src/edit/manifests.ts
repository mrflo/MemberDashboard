import { MEMBER_DASHBOARD_EDIT_MODAL_ALIAS } from "../constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "modal",
    alias: MEMBER_DASHBOARD_EDIT_MODAL_ALIAS,
    name: "Member Dashboard Edit Modal",
    element: () => import("./member-edit-modal.element.js"),
  },
];
