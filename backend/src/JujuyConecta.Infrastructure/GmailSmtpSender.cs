using JujuyConecta.Application;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
namespace JujuyConecta.Infrastructure;
// Gmail SMTP with a dedicated Gmail account and app password (where Google allows it).
// Use a mail provider or OAuth 2.0 for production or higher sending volume.
public sealed class GmailSmtpSender(IConfiguration config):IEmailSender
{
    public async Task SendAsync(string to, string subject, string text, CancellationToken ct)
    {
        var from=config["Gmail:Address"];
        var password=config["Gmail:AppPassword"];
        if (string.IsNullOrWhiteSpace(from)||string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("Gmail:Address y Gmail:AppPassword deben configurarse mediante secretos de despliegue.");
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("JujuyConecta", from));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject=subject;
        message.Body=new TextPart("plain"){Text=text};
        using var smtp=new SmtpClient();
        await smtp.ConnectAsync("smtp.gmail.com",587,SecureSocketOptions.StartTls,ct);
        await smtp.AuthenticateAsync(from,password,ct);
        await smtp.SendAsync(message,ct);
        await smtp.DisconnectAsync(true,ct);
    }
}
