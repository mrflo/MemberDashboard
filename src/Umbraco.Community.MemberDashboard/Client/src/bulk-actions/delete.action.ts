import type { MemberBulkActionType } from "../api/index.js";
import { UmbMemberBulkActionBase, type UmbMemberBulkActionConfirmation } from "./member-bulk-action.base.js";

/** Permanently deletes the selected members. */
export class UmbMemberBulkDeleteAction extends UmbMemberBulkActionBase {
  protected override action: MemberBulkActionType = "Delete";

  protected override confirmation(): UmbMemberBulkActionConfirmation {
    return {
      headline: this.localize.term("memberDashboard_bulkDeleteConfirmHeadline"),
      message: this.localize.term("memberDashboard_bulkDeleteConfirmMessage", this.selection.length),
      confirmLabel: this.localize.term("memberDashboard_bulkDelete"),
      color: "danger",
    };
  }
}

export { UmbMemberBulkDeleteAction as api };
export default UmbMemberBulkDeleteAction;
