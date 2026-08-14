import { UmbModalToken } from "@umbraco-cms/backoffice/modal";
import { MEMBER_DASHBOARD_EDIT_MODAL_ALIAS } from "../constants.js";

export interface UmbMemberEditModalData {
  /** Key of the member to edit. */
  unique: string;
}

export interface UmbMemberEditModalValue {
  /** True when changes were saved, so the caller knows whether to refresh the collection. */
  saved: boolean;
}

/**
 * Opens as a sidebar panel sliding in from the right, rather than a centered dialog — editing a
 * member is a side task next to the table, and the panel keeps the list visible behind it.
 */
export const MEMBER_EDIT_MODAL = new UmbModalToken<UmbMemberEditModalData, UmbMemberEditModalValue>(
  MEMBER_DASHBOARD_EDIT_MODAL_ALIAS,
  {
    modal: {
      type: "sidebar",
      size: "medium",
    },
  },
);
