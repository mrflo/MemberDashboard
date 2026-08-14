import type { MemberBulkActionType } from "../api/index.js";
import { UmbMemberBulkActionBase } from "./member-bulk-action.base.js";

/** Approves the selected members so they can log in. */
export class UmbMemberBulkApproveAction extends UmbMemberBulkActionBase {
  protected override action: MemberBulkActionType = "Approve";
}

export { UmbMemberBulkApproveAction as api };
export default UmbMemberBulkApproveAction;
