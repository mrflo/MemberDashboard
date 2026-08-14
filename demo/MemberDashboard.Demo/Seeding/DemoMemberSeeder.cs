using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace MemberDashboard.Demo.Seeding;

/// <summary>
/// Creates a spread of demo members the first time the site starts, so the Member Dashboard has
/// something realistic to filter, sort and act on: several groups, some members awaiting approval,
/// and some locked out with failed login attempts on the clock.
/// </summary>
/// <remarks>
/// Demo-site only — this never ships in the NuGet package.
/// </remarks>
public class DemoMemberSeeder : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    private const int MemberCount = 60;

    private static readonly string[] Groups = ["Subscribers", "Contributors", "Beta Testers"];

    private static readonly string[] FirstNames =
    [
        "Ada", "Blair", "Casey", "Devon", "Emery", "Frankie", "Grey", "Harper", "Indigo", "Jules",
        "Kai", "Lennox", "Marlow", "Nico", "Oakley", "Parker", "Quinn", "River", "Sasha", "Tatum",
    ];

    private static readonly string[] LastNames =
    [
        "Ashford", "Bennett", "Calloway", "Devereux", "Ellison", "Fairbanks", "Granger", "Hollis",
        "Ingram", "Jarvis", "Kingsley", "Lockhart", "Marsden", "Norwood", "Ortega", "Pemberton",
    ];

    private readonly IMemberService _memberService;
    private readonly IMemberGroupService _memberGroupService;
    private readonly IMemberTypeService _memberTypeService;
    private readonly ILogger<DemoMemberSeeder> _logger;

    public DemoMemberSeeder(
        IMemberService memberService,
        IMemberGroupService memberGroupService,
        IMemberTypeService memberTypeService,
        ILogger<DemoMemberSeeder> logger)
    {
        _memberService = memberService;
        _memberGroupService = memberGroupService;
        _memberTypeService = memberTypeService;
        _logger = logger;
    }

    public async Task HandleAsync(UmbracoApplicationStartedNotification notification, CancellationToken cancellationToken)
    {
        // Seeding is a one-shot: if anyone is already in the database, leave it alone so a
        // developer's own test data survives restarts.
        if (_memberService.Count() > 0)
        {
            return;
        }

        IMemberType? memberType = _memberTypeService.GetDefault() is { } alias
            ? _memberTypeService.Get(alias)
            : null;

        if (memberType is null)
        {
            _logger.LogWarning("Demo seeding skipped: no default member type is available.");
            return;
        }

        await EnsureGroupsAsync();

        var random = new Random(42); // Fixed seed so every developer gets the same demo data.

        for (var i = 0; i < MemberCount; i++)
        {
            var firstName = FirstNames[i % FirstNames.Length];
            var lastName = LastNames[(i * 7) % LastNames.Length];
            var name = $"{firstName} {lastName}";
            var username = $"{firstName}.{lastName}{i}".ToLowerInvariant();
            var email = $"{username}@example.com";

            IMember member = _memberService.CreateMemberWithIdentity(username, email, name, memberType);

            // Roughly a fifth are awaiting approval and a tenth are locked out, which is enough for
            // the status filters and the bulk unlock/approve actions to have something to chew on.
            member.IsApproved = i % 5 != 0;
            member.IsLockedOut = i % 10 == 3;

            if (member.IsLockedOut)
            {
                member.FailedPasswordAttempts = random.Next(3, 12);
                member.LastLockoutDate = DateTime.Now.AddDays(-random.Next(1, 30));
            }

            if (member.IsApproved && i % 3 != 0)
            {
                member.LastLoginDate = DateTime.Now.AddDays(-random.Next(0, 90));
            }

            _memberService.Save(member);

            // Spread members across groups, leaving every fourth member in none so the group
            // filter has an "unassigned" population to exclude.
            if (i % 4 != 0)
            {
                _memberService.AssignRole(username, Groups[i % Groups.Length]);
            }
        }

        _logger.LogInformation("Seeded {Count} demo members across {GroupCount} groups.", MemberCount, Groups.Length);
    }

    private async Task EnsureGroupsAsync()
    {
        foreach (var groupName in Groups)
        {
            if (await _memberGroupService.GetByNameAsync(groupName) is not null)
            {
                continue;
            }

            await _memberGroupService.CreateAsync(new MemberGroup { Name = groupName });
        }
    }
}
