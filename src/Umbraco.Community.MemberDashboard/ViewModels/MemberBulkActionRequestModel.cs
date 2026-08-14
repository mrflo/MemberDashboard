using System.ComponentModel.DataAnnotations;

namespace Umbraco.Community.MemberDashboard.ViewModels;

/// <summary>
/// A request to apply one bulk operation to a set of members.
/// </summary>
public class MemberBulkActionRequestModel
{
    /// <summary>
    /// The keys of the members to act on.
    /// </summary>
    [Required]
    [MinLength(1)]
    public required IEnumerable<Guid> MemberIds { get; init; }

    /// <summary>
    /// The operation to apply to every member in <see cref="MemberIds" />.
    /// </summary>
    [Required]
    public required MemberBulkActionType Action { get; init; }
}
