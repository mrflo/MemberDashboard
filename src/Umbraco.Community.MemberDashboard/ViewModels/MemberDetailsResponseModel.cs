namespace Umbraco.Community.MemberDashboard.ViewModels;

/// <summary>
/// The fields the dashboard table needs but cannot read from <c>filter/member</c>, which returns
/// them empty: the member's group names and the date the member was created.
/// </summary>
public class MemberDetailsResponseModel
{
    /// <summary>
    /// The key of the member these details belong to.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// The names of the groups the member belongs to. Names rather than keys, because that is what
    /// the dashboard displays and what its group filter matches on.
    /// </summary>
    public required IEnumerable<string> Groups { get; init; }

    /// <summary>
    /// When the member was created.
    /// </summary>
    public required DateTime CreateDate { get; init; }
}