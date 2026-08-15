using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.MemberDashboard.ViewModels;

namespace Umbraco.Community.MemberDashboard.Controllers;

/// <summary>
/// Fills in the gaps the Management API leaves in a member listing.
/// </summary>
/// <remarks>
/// <c>GET filter/member</c> — the endpoint the dashboard collection reads — returns every member
/// with <c>groups: []</c> and a default <c>createDate</c> of <c>0001-01-01</c>, regardless of what
/// is actually stored. Without this endpoint the dashboard's Groups column is always blank and its
/// Created column always shows the same wrong date. There is no batch alternative in the Management
/// API: the only way to get the real values is the per-member detail endpoint, which would be one
/// request per row.
/// </remarks>
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "Member Dashboard")]
public class MemberDetailsController : MemberDashboardControllerBase
{
    private readonly IMemberService _memberService;

    /// <summary>
    /// Initialises a new instance of the <see cref="MemberDetailsController" /> class.
    /// </summary>
    public MemberDetailsController(IMemberService memberService)
        => _memberService = memberService;

    /// <summary>
    /// Returns the group names and creation date of every requested member.
    /// </summary>
    /// <remarks>
    /// A POST rather than a GET because a full page of member keys does not reliably fit in a query
    /// string. Members that no longer exist are simply absent from the response.
    /// </remarks>
    [HttpPost("details")]
    [ProducesResponseType<IEnumerable<MemberDetailsResponseModel>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Details(
        MemberDetailsRequestModel request,
        CancellationToken cancellationToken)
    {
        Guid[] memberIds = request.MemberIds.Distinct().ToArray();

        if (memberIds.Length == 0)
        {
            return BadRequest("At least one member must be requested.");
        }

        // Roles are read one member at a time (see below), so the same ceiling that protects the
        // bulk endpoint applies here.
        if (memberIds.Length > Constants.MaxBulkBatchSize)
        {
            return BadRequest($"Details can be requested for at most {Constants.MaxBulkBatchSize} members at a time.");
        }

        cancellationToken.ThrowIfCancellationRequested();

        IEnumerable<IMember> members = await _memberService.GetByKeysAsync(memberIds);

        // One roles query per member. Umbraco exposes no batched equivalent — GetAllRoles is the
        // only member-to-group lookup there is — but a page of the dashboard is 50 rows, and each
        // query is a single indexed read.
        var details = members
            .Select(member => new MemberDetailsResponseModel
            {
                Id = member.Key,
                Groups = _memberService.GetAllRoles(member.Username).ToArray(),
                CreateDate = member.CreateDate,
            })
            .ToArray();

        return Ok(details);
    }
}