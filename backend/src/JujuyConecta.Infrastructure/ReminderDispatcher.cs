using JujuyConecta.Application;
using JujuyConecta.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
namespace JujuyConecta.Infrastructure;
// A Supabase Cron / pg_net request can trigger this service every minute.
// Claims are conditional DB updates, preventing simultaneous workers from sending the same pending row.
public sealed class ReminderDispatcher(JujuyDbContext db,IEmailSender mailer,TimeProvider clock,ILogger<ReminderDispatcher> log)
{
    public async Task<int> DispatchDueAsync(CancellationToken ct)
    {
        var now=clock.GetUtcNow();
        // No email should be sent after an event has already started.
        var candidates=await db.AttendanceReminders.AsNoTracking()
            .Where(r=>r.ReminderConsent && r.ReminderDueAtUtc<=now && r.Event.StartsAtUtc>now &&
                ((r.Status==ReminderState.Pending && (r.NextAttemptAtUtc==null||r.NextAttemptAtUtc<=now)) ||
                 (r.Status==ReminderState.Processing && r.LockedUntilUtc<now)))
            .OrderBy(r=>r.ReminderDueAtUtc).Select(r=>r.Id).Take(50).ToListAsync(ct);
        var processed=0;
        foreach(var id in candidates)
        {
            var claimed=await db.AttendanceReminders.Where(r=>r.Id==id &&
                ((r.Status==ReminderState.Pending && (r.NextAttemptAtUtc==null||r.NextAttemptAtUtc<=now)) ||
                 (r.Status==ReminderState.Processing && r.LockedUntilUtc<now)))
               .ExecuteUpdateAsync(setters=>setters
                  .SetProperty(r=>r.Status,ReminderState.Processing)
                  .SetProperty(r=>r.LockedUntilUtc,now.AddMinutes(10))
                  .SetProperty(r=>r.Attempts,r=>r.Attempts+1),ct);
            if(claimed!=1) continue;
            db.ChangeTracker.Clear();
            var r=await db.AttendanceReminders.Include(x=>x.Event).SingleAsync(x=>x.Id==id,ct);
            try
            {
                var localTime=TimeZoneInfo.ConvertTime(r.Event.StartsAtUtc, TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Jujuy"));
                var body=$"¡Mañana tenés un evento en JujuyConecta!\n\n{r.Event.Title}\nFecha: {localTime:dd/MM/yyyy HH:mm} (Jujuy)\nLugar: {r.Event.Location}\n\n"+
                         (r.Event.IsDemo?"ATENCIÓN: este es un EVENTO FICTICIO de demostración.\n\n":"")+
                         "Recibiste este mensaje porque aceptaste un recordatorio para este evento.";
                await mailer.SendAsync(r.Email,$"Recordatorio: {r.Event.Title}",body,ct);
                r.Status=ReminderState.Sent;r.SentAtUtc=clock.GetUtcNow();r.LockedUntilUtc=null;
                processed++;
            }
            catch(Exception ex) when(ex is not OperationCanceledException)
            {
                // No PII or SMTP credentials are written to application logs.
                log.LogWarning("Reminder delivery failed for reminder id {ReminderId}: {ErrorType}",r.Id,ex.GetType().Name);
                r.Status=r.Attempts>=5?ReminderState.Failed:ReminderState.Pending;
                r.NextAttemptAtUtc=clock.GetUtcNow().AddMinutes(Math.Min(60,Math.Pow(2,r.Attempts)));
                r.LockedUntilUtc=null;
            }
            await db.SaveChangesAsync(ct);
        }
        return processed;
    }
}
