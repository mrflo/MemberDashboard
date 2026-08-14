using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Community.MemberDashboard.Services;
using Umbraco.Community.MemberDashboard.ViewModels;

namespace Umbraco.Community.MemberDashboard.Controllers;

/// <summary>
/// Applies a single operation to many members in one request.
/// </summary>
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "Member Dashboard")]
public class MemberBulkActionController : MemberDashboardControllerBase
{
    private readonly IMemberBulkActionService _memberBulkActionService;

    /// <summary>
    /// Initialises a new instance of the <see cref="MemberBulkActionController" /> class.
    /// </summary>
    public MemberBulkActionController(IMemberBulkActionService memberBulkActionService)
        => _memberBulkActionService = memberBulkActionService;

    /// <summary>
    /// Applies the requested action to every member in the selection.
    /// </summary>
    /// <remarks>
    /// Returns 200 even when some members failed, because the operation is applied per member.
    /// Inspect <see cref="MemberBulkActionResponseModel.Failed" /> to see what did not go through.
    /// </remarks>
    [HttpPost("bulk")]
    [ProducesResponseType<MemberBulkActionResponseModel>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Bulk(
        MemberBulkActionRequestModel request,
        CancellationToken cancellationToken)
    {
        Guid[] memberIds = request.MemberIds.Distinct().ToArray();

        if (memberIds.Length == 0)
        {
            return BadRequest("At least one member must be selected.");
        }

        if (memberIds.Length > Constants.MaxBulkBatchSize)
        {
            return BadRequest($"A bulk action can target at most {Constants.MaxBulkBatchSize} members at a time.");
        }

        cancellationToken.ThrowIfCancellationRequested();

        MemberBulkActionResponseModel result =
            await _memberBulkActionService.ExecuteAsync(memberIds, request.Action);

        return Ok(result);
    }
}
