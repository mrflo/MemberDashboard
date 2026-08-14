namespace Umbraco.Community.MemberDashboard.ViewModels;

/// <summary>
/// The bulk operations this package can apply to a selection of members.
/// </summary>
public enum MemberBulkActionType
{
    /// <summary>
    /// Clears the lockout flag and resets the failed password attempt counter.
    /// </summary>
    Unlock,

    /// <summary>
    /// Marks the members as approved, allowing them to log in.
    /// </summary>
    Approve,

    /// <summary>
    /// Removes approval, suspending the members without deleting them.
    /// </summary>
    Unapprove,

    /// <summary>
    /// Permanently deletes the members.
    /// </summary>
    Delete,
}
