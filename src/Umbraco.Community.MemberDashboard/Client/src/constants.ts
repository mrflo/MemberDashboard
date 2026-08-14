/**
 * Extension aliases used across the package. Keeping them in one place makes the
 * cross-references between manifests (collection ↔ view ↔ bulk action conditions) explicit.
 */

export const MEMBER_DASHBOARD_ALIAS = "MemberDashboard.Dashboard";

export const MEMBER_DASHBOARD_COLLECTION_ALIAS = "MemberDashboard.Collection";
export const MEMBER_DASHBOARD_COLLECTION_REPOSITORY_ALIAS = "MemberDashboard.Repository.Collection";
export const MEMBER_DASHBOARD_TABLE_VIEW_ALIAS = "MemberDashboard.CollectionView.Table";

export const MEMBER_DASHBOARD_EDIT_MODAL_ALIAS = "MemberDashboard.Modal.MemberEdit";

export const MEMBER_DASHBOARD_BULK_UNLOCK_ALIAS = "MemberDashboard.EntityBulkAction.Unlock";
export const MEMBER_DASHBOARD_BULK_APPROVE_ALIAS = "MemberDashboard.EntityBulkAction.Approve";
export const MEMBER_DASHBOARD_BULK_UNAPPROVE_ALIAS = "MemberDashboard.EntityBulkAction.Unapprove";
export const MEMBER_DASHBOARD_BULK_DELETE_ALIAS = "MemberDashboard.EntityBulkAction.Delete";
