using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.MemberDashboard.ViewModels;

namespace Umbraco.Community.MemberDashboard.Services;

/// <inheritdoc />
public class MemberBulkActionService : IMemberBulkActionService
{
    private readonly IMemberService _memberService;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly ILogger<MemberBulkActionService> _logger;

    /// <summary>
    /// Initialises a new instance of the <see cref="MemberBulkActionService" /> class.
    /// </summary>
    public MemberBulkActionService(
        IMemberService memberService,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
        ILogger<MemberBulkActionService> logger)
    {
        _memberService = memberService;
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<MemberBulkActionResponseModel> ExecuteAsync(IEnumerable<Guid> memberIds, MemberBulkActionType action)
    {
        Guid[] ids = memberIds.Distinct().ToArray();
        int userId = CurrentUserId();

        IMember[] members = (await _memberService.GetByKeysAsync(ids)).ToArray();

        var failures = new List<MemberBulkActionFailureModel>();
        var succeeded = 0;

        // Anything we asked for but did not get back no longer exists. Report it rather than
        // silently counting it as a success.
        foreach (Guid missing in ids.Except(members.Select(member => member.Key)))
        {
            failures.Add(new MemberBulkActionFailureModel
            {
                Id = missing,
                Name = null,
                Reason = "The member no longer exists.",
            });
        }

        foreach (IMember member in members)
        {
            try
            {
                Apply(member, action, userId);
                succeeded++;
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "Member dashboard bulk action {Action} failed for member {MemberKey}",
                    action,
                    member.Key);

                failures.Add(new MemberBulkActionFailureModel
                {
                    Id = member.Key,
                    Name = member.Name,
                    Reason = exception.Message,
                });
            }
        }

        return new MemberBulkActionResponseModel
        {
            Succeeded = succeeded,
            Failed = failures,
        };
    }

    private void Apply(IMember member, MemberBulkActionType action, int userId)
    {
        switch (action)
        {
            case MemberBulkActionType.Unlock:
                // Clearing the flag alone would leave the member one failed attempt away from being
                // locked out again, so reset the counter too. This is the reason the dashboard needs a
                // server-side endpoint at all: the Management API's member update model has no
                // failedPasswordAttempts field.
                member.IsLockedOut = false;
                member.FailedPasswordAttempts = 0;
                _memberService.Save(member, userId);
                break;

            case MemberBulkActionType.Approve:
                member.IsApproved = true;
                _memberService.Save(member, userId);
                break;

            case MemberBulkActionType.Unapprove:
                member.IsApproved = false;
                _memberService.Save(member, userId);
                break;

            case MemberBulkActionType.Delete:
                _memberService.Delete(member, userId);
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(action), action, "Unsupported bulk action.");
        }
    }

    private int CurrentUserId()
    {
        int? currentUserId = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser?.Id;
        if (currentUserId.HasValue)
        {
            return currentUserId.Value;
        }

        // Every entry point into this service is behind backoffice authentication, so this is only
        // reached if the security context is somehow unavailable. IMemberService still takes an int
        // user id, and SuperUserId is the only way to express "system" as an int — the Guid-based
        // replacement has no matching Save/Delete overload yet.
#pragma warning disable CS0618 // Type or member is obsolete
        return Cms.Core.Constants.Security.SuperUserId;
#pragma warning restore CS0618
    }
}
