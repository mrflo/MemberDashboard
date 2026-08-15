using System.ComponentModel.DataAnnotations;

namespace Umbraco.Community.MemberDashboard.ViewModels;

/// <summary>
/// A request for the per-member details that the Management API's <c>filter/member</c> endpoint
/// leaves unpopulated.
/// </summary>
public class MemberDetailsRequestModel
{
    /// <summary>
    /// The keys of the members to look up. Expected to be one page of the dashboard collection.
    /// </summary>
    [Required]
    [MinLength(1)]
    public required IEnumerable<Guid> MemberIds { get; init; }
}