namespace JujuyConecta.Domain;
public enum ReminderState { Pending = 0, Processing = 1, Sent = 2, Failed = 3, Cancelled = 4 }
public sealed class CommunityEvent
{
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? GeoSource { get; set; }
    public long Id { get; set; }
    public string Title { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTimeOffset StartsAtUtc { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? AdmissionInfo { get; set; }
    public string? ImageUrl { get; set; }
    public string? SourceUrl { get; set; }
    public string? SourceKey { get; set; }
    public string? VisitorTip { get; set; }
    public string? Organizer { get; set; }
    public bool Published { get; set; }
    public bool IsDemo { get; set; }
}
public sealed class AttendanceReminder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public long EventId { get; set; }
    public CommunityEvent Event { get; set; } = null!;
    public string Email { get; set; } = "";
    public string EmailNormalized { get; set; } = "";
    public bool ReminderConsent { get; set; }
    public bool NewsConsent { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset ReminderDueAtUtc { get; set; }
    public ReminderState Status { get; set; } = ReminderState.Pending;
    public DateTimeOffset? LockedUntilUtc { get; set; }
    public DateTimeOffset? NextAttemptAtUtc { get; set; }
    public DateTimeOffset? SentAtUtc { get; set; }
    public int Attempts { get; set; }
}
