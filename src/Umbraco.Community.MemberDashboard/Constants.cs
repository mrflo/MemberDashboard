namespace Umbraco.Community.MemberDashboard;

/// <summary>
/// Package-wide constants.
/// </summary>
public static class Constants
{
    /// <summary>
    /// Name of the dedicated OpenAPI document for this package. Served from
    /// <c>/umbraco/openapi/memberdashboard.json</c> and consumed by <c>npm run generate-client</c>.
    /// </summary>
    public const string ApiName = "memberdashboard";

    /// <summary>
    /// Route prefix for this package's backoffice API, giving
    /// <c>/umbraco/member-dashboard/api/v1/...</c>.
    /// </summary>
    public const string ApiRoute = "member-dashboard/api/v{version:apiVersion}";

    /// <summary>
    /// Upper bound on how many members a single bulk request may target. Keeps one careless request
    /// from locking the member tables for an unbounded amount of time.
    /// </summary>
    public const int MaxBulkBatchSize = 500;
}
