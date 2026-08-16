export default {
  memberDashboard: {
    // Dashboard
    dashboardLabel: "Member Dashboard",

    // Filters
    filterQueryLabel: "Filter members",
    filterGroupLabel: "Member group",
    filterAllGroups: "All groups",
    filterApprovedLabel: "Approval",
    filterAnyStatus: "Any approval",
    filterLockedOutLabel: "Lockout",
    filterAnyLockout: "Any lockout",
    clearFilters: "Clear filters",

    // Table columns
    columnGroups: "Groups",
    columnStatus: "Status",
    columnLastLogin: "Last login",
    columnCreated: "Created",

    // Member states
    active: "Active",
    approved: "Approved",
    notApproved: "Not approved",
    lockedOut: "Locked out",
    notLockedOut: "Not locked out",

    // Bulk actions
    bulkUnlock: "Unlock",
    bulkApprove: "Approve",
    bulkUnapprove: "Unapprove",
    bulkDelete: "Delete",

    bulkUnapproveConfirmHeadline: "Unapprove members?",
    bulkUnapproveConfirmMessage:
      "%0% selected members will no longer be able to log in. You can approve them again at any time.",
    bulkDeleteConfirmHeadline: "Delete members?",
    bulkDeleteConfirmMessage: "%0% selected members will be permanently deleted. This cannot be undone.",

    bulkSuccessHeadline: "Members updated",
    bulkSuccessMessage: "%0% members were updated.",
    bulkPartialHeadline: "Some members were not updated",
    bulkPartialMessage: "%0% members were updated, %1% failed.",
    bulkFailureHeadline: "Nothing was updated",
    bulkFailureMessage: "None of the selected members could be updated.",

    // Edit panel
    editHeadline: "Edit member",
    editOpenFullEditor: "Open full editor",
    editNewPassword: "New password",
    editNewPasswordDescription: "Leave blank to keep the current password.",
    editGroups: "Member groups",
    editApproved: "Approved",
    editLockedOut: "Locked out",
    editTwoFactor: "Two-factor authentication enabled",
    editFailedAttempts: "Failed login attempts",
    editLastLogin: "Last login",
    editLastLockout: "Last lockout",
    editNever: "Never",
    editLoadFailed: "This member could not be loaded.",
    editSaveFailed: "The member could not be saved.",
    editSaved: "Member saved",
  },
};
