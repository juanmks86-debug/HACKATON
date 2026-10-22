using JujuyConecta.Domain;
using Microsoft.EntityFrameworkCore;
namespace JujuyConecta.Infrastructure;
public sealed class JujuyDbContext(DbContextOptions<JujuyDbContext> options) : DbContext(options)
{
    public DbSet<CommunityEvent> Events => Set<CommunityEvent>();
    public DbSet<AttendanceReminder> AttendanceReminders => Set<AttendanceReminder>();
    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<CommunityEvent>(e =>
        {
            e.ToTable("events"); e.HasKey(x=>x.Id);
            e.Property(x=>x.Title).HasMaxLength(180).IsRequired();
            e.Property(x=>x.Latitude).HasPrecision(9,6);
            e.Property(x=>x.Longitude).HasPrecision(9,6);
            e.Property(x=>x.GeoSource).HasMaxLength(160);
            e.Property(x=>x.Location).HasMaxLength(300).IsRequired();
            e.Property(x=>x.Category).HasMaxLength(80);
            e.Property(x=>x.AdmissionInfo).HasMaxLength(180);
            e.Property(x=>x.SourceKey).HasMaxLength(120);
            e.Property(x=>x.VisitorTip).HasMaxLength(400);
            e.Property(x=>x.Organizer).HasMaxLength(180);
            e.HasIndex(x=>x.SourceKey).IsUnique().HasFilter("\"SourceKey\" IS NOT NULL");
        });
        model.Entity<AttendanceReminder>(e=>
        {
            e.ToTable("attendance_reminders");e.HasKey(x=>x.Id);
            e.Property(x=>x.Email).HasMaxLength(254).IsRequired();
            e.Property(x=>x.EmailNormalized).HasMaxLength(254).IsRequired();
            e.Property(x=>x.Status).HasConversion<string>().HasMaxLength(24);
            e.HasIndex(x=>new{x.EventId,x.EmailNormalized}).IsUnique();
            e.HasIndex(x=>new{x.Status,x.ReminderDueAtUtc});
            e.HasOne(x=>x.Event).WithMany().HasForeignKey(x=>x.EventId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
