using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace Umbraco.Community.MemberDashboard.Controllers;

/// <summary>
/// Base controller for the Member Dashboard backoffice API. Routes under
/// <c>/umbraco/member-dashboard/api/v1</c>, is grouped into this package's own OpenAPI document, and
/// requires the same access as Umbraco's own member endpoints.
/// </summary>
[ApiController]
[BackOfficeRoute(Constants.ApiRoute)]
[Authorize(Policy = AuthorizationPolicies.SectionAccessMembers)]
[MapToApi(Constants.ApiName)]
[JsonOptionsName(Cms.Core.Constants.JsonOptionsNames.BackOffice)]
public abstract class MemberDashboardControllerBase : ControllerBase
{
}
