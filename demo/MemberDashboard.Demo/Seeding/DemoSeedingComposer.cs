using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace MemberDashboard.Demo.Seeding;

/// <summary>
/// Wires up demo data seeding for the sample site.
/// </summary>
public class DemoSeedingComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
        => builder.AddNotificationAsyncHandler<UmbracoApplicationStartedNotification, DemoMemberSeeder>();
}
