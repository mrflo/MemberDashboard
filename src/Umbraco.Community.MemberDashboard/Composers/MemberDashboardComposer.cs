using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Community.MemberDashboard.Services;

namespace Umbraco.Community.MemberDashboard.Composers;

/// <summary>
/// Registers this package's services and its dedicated OpenAPI document.
/// </summary>
/// <remarks>
/// The package gets its own document (rather than joining the built-in "management" one) so that
/// <c>npm run generate-client</c> produces a client for these endpoints alone instead of the whole
/// Management API surface.
/// </remarks>
public class MemberDashboardComposer : IComposer
{
    /// <inheritdoc />
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<IMemberBulkActionService, MemberBulkActionService>();

        builder.AddBackOfficeOpenApiDocument(
            Constants.ApiName,
            document => document
                .WithTitle("Member Dashboard Backoffice API")
                .WithBackOfficeAuthentication()
                .WithJsonOptions(Cms.Core.Constants.JsonOptionsNames.BackOffice)
                .ConfigureOpenApiOptions(options =>
                    options.AddDocumentTransformer((doc, _, _) =>
                    {
                        doc.Info.Version = "1.0";
                        doc.Info.Description = "Bulk member operations for the Umbraco Member Dashboard package.";
                        return Task.CompletedTask;
                    })));
    }
}
