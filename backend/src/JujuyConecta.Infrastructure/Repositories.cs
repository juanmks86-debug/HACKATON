using JujuyConecta.Application;
using JujuyConecta.Domain;
using Microsoft.EntityFrameworkCore;
namespace JujuyConecta.Infrastructure;
public sealed class EfEventReader(JujuyDbContext db):IEventReader
{
    public Task<CommunityEvent?> FindAsync(long eventId, CancellationToken ct) =>
        db.Events.AsNoTracking().FirstOrDefaultAsync(e=>e.Id==eventId,ct);
}
public sealed class EfAttendanceWriter(JujuyDbContext db):IAttendanceWriter
{
    public Task<bool> ExistsAsync(long eventId, string normalizedEmail, CancellationToken ct) =>
        db.AttendanceReminders.AnyAsync(x=>x.EventId==eventId&&x.EmailNormalized==normalizedEmail,ct);
    public async Task AddAsync(AttendanceReminder reminder, CancellationToken ct)
    {
        db.AttendanceReminders.Add(reminder);
        await db.SaveChangesAsync(ct);
    }
}
