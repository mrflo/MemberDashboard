import type { MemberBulkActionType } from "../api/index.js";
import { UmbMemberBulkActionBase } from "./member-bulk-action.base.js";

/** Clears lockout and resets the failed login counter for the selected members. */
export class UmbMemberBulkUnlockAction extends UmbMemberBulkActionBase {
  protected override action: MemberBulkActionType = "Unlock";
}

export { UmbMemberBulkUnlockAction as api };
export default UmbMemberBulkUnlockAction;
