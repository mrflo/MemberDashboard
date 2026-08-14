import type { MemberBulkActionType } from "../api/index.js";
import { UmbMemberBulkActionBase, type UmbMemberBulkActionConfirmation } from "./member-bulk-action.base.js";

/** Suspends the selected members by removing approval. Reversible, but locks people out, so it confirms first. */
export class UmbMemberBulkUnapproveAction extends UmbMemberBulkActionBase {
  protected override action: MemberBulkActionType = "Unapprove";

  protected override confirmation(): UmbMemberBulkActionConfirmation {
    return {
      headline: this.localize.term("memberDashboard_bulkUnapproveConfirmHeadline"),
      message: this.localize.term("memberDashboard_bulkUnapproveConfirmMessage", this.selection.length),
      confirmLabel: this.localize.term("memberDashboard_bulkUnapprove"),
      color: "warning",
    };
  }
}

export { UmbMemberBulkUnapproveAction as api };
export default UmbMemberBulkUnapproveAction;
