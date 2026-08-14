using Umbraco.Community.MemberDashboard.ViewModels;

namespace Umbraco.Community.MemberDashboard.Services;

/// <summary>
/// Applies a bulk operation to a set of members.
/// </summary>
public interface IMemberBulkActionService
{
    /// <summary>
    /// Applies <paramref name="action" /> to every member in <paramref name="memberIds" />.
    /// Members are processed independently: a failure on one does not abort the rest.
    /// </summary>
    Task<MemberBulkActionResponseModel> ExecuteAsync(IEnumerable<Guid> memberIds, MemberBulkActionType action);
}
