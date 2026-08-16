using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Community.MemberDashboard.Services;

namespace Umbraco.Community.MemberDashboard.Composers;

/// <summary>
/// Registers this package's services and its dedicated OpenAPI document.
/// </summary>
public class MemberDashboardComposer : IComposer
{
    /// <inheritdoc />
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<IMemberBulkActionService, MemberBulkActionService>();

        // Umbraco 17 generates its OpenAPI documents with Swashbuckle; 18 replaced that with
        // Microsoft.AspNetCore.OpenApi and AddBackOfficeOpenApiDocument.
        builder.Services.AddSwaggerGen(options =>
            options.SwaggerDoc(Constants.ApiName, new OpenApiInfo
            {
                Title = "Member Dashboard Backoffice API",
                Version = "1.0",
                Description = "Bulk member operations and member listing details for the Umbraco Member Dashboard package.",
            }));
    }
}
