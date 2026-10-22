using System.Net.Mail;
using JujuyConecta.Domain;
namespace JujuyConecta.Application;
public sealed record RegisterAttendanceRequest(long EventId, string Email, bool ReminderConsent, bool NewsConsent);
public sealed record RegistrationOutcome(bool Ok, int StatusCode, string Message);
public interface IEventReader { Task<CommunityEvent?> FindAsync(long eventId, CancellationToken ct); }
public interface IAttendanceWriter
{
    Task<bool> ExistsAsync(long eventId, string normalizedEmail, CancellationToken ct);
    Task AddAsync(AttendanceReminder reminder, CancellationToken ct);
}
public interface IEmailSender { Task SendAsync(string to, string subject, string text, CancellationToken ct); }
public sealed class RegisterAttendanceService(IEventReader events, IAttendanceWriter attendances, TimeProvider clock)
{
    public async Task<RegistrationOutcome> RegisterAsync(RegisterAttendanceRequest input, CancellationToken ct)
    {
        if (!input.ReminderConsent) return new(false,400,"Necesitamos tu consentimiento para enviarte este recordatorio.");
        var email = input.Email?.Trim() ?? "";
        try { _ = new MailAddress(email); } catch { return new(false,400,"Ingresá un correo electrónico válido."); }
        if (email.Length > 254 || email.Any(char.IsWhiteSpace)) return new(false,400,"Ingresá un correo electrónico válido.");
        var item = await events.FindAsync(input.EventId, ct);
        if (item is null || !item.Published) return new(false,404,"No encontramos el evento publicado.");
        var now = clock.GetUtcNow();
        // A 24-hour reminder is impossible for events starting in less than 24 hours.
        if (item.StartsAtUtc <= now.AddHours(24)) return new(false,409,"El evento comienza dentro de las próximas 24 horas o ya finalizó. Podés usar el calendario.");
        var normalized = email.ToLowerInvariant();
        if (await attendances.ExistsAsync(item.Id, normalized, ct)) return new(true,200,"Ya existe una solicitud de recordatorio para este correo y evento.");
        var reminder = new AttendanceReminder
        {
            EventId = item.Id, Email=email, EmailNormalized=normalized, ReminderConsent=true,
            NewsConsent=input.NewsConsent, CreatedAtUtc=now,
            ReminderDueAtUtc=item.StartsAtUtc.AddHours(-24), Status=ReminderState.Pending
        };
        await attendances.AddAsync(reminder, ct);
        return new(true,201,"Recordatorio registrado para 24 horas antes del comienzo. Su envío requiere que Gmail y la tarea programada estén configurados.");
    }
}
