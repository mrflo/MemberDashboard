namespace Umbraco.Community.MemberDashboard.ViewModels;

/// <summary>
/// The outcome of a bulk operation. Members are processed independently, so a request can
/// partially succeed — the caller is told exactly which members failed and why.
/// </summary>
public class MemberBulkActionResponseModel
{
    /// <summary>
    /// How many members the operation was applied to successfully.
    /// </summary>
    public required int Succeeded { get; init; }

    /// <summary>
    /// The members the operation could not be applied to.
    /// </summary>
    public required IEnumerable<MemberBulkActionFailureModel> Failed { get; init; }
}

/// <summary>
/// A single member that a bulk operation could not be applied to.
/// </summary>
public class MemberBulkActionFailureModel
{
    /// <summary>
    /// The key of the member that failed.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// The member's name, when it could be resolved.
    /// </summary>
    public required string? Name { get; init; }

    /// <summary>
    /// Why the operation failed for this member.
    /// </summary>
    public required string Reason { get; init; }
}
