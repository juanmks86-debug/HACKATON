using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using JujuyConecta.Application;
using JujuyConecta.Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder=WebApplication.CreateBuilder(args);
var connection=builder.Configuration.GetConnectionString("Supabase");
if(string.IsNullOrWhiteSpace(connection))
    throw new InvalidOperationException("Set ConnectionStrings__Supabase with your Supabase PostgreSQL connection string.");
builder.Services.AddDbContext<JujuyDbContext>(o=>o.UseNpgsql(connection));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IEventReader,EfEventReader>();
builder.Services.AddScoped<IAttendanceWriter,EfAttendanceWriter>();
builder.Services.AddScoped<RegisterAttendanceService>();
builder.Services.AddScoped<IEmailSender,GmailSmtpSender>();
builder.Services.AddScoped<ReminderDispatcher>();
builder.Services.AddRateLimiter(options=>
{
    options.RejectionStatusCode=StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("registrations",cfg=>{cfg.PermitLimit=10;cfg.Window=TimeSpan.FromMinutes(1);cfg.QueueLimit=0;});
});
var origins=builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()??[];
builder.Services.AddCors(o=>o.AddPolicy("frontend",p=>p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));
var app=builder.Build();
app.UseHttpsRedirection();app.UseCors("frontend");app.UseRateLimiter();
// Iteración 1: listado público de eventos publicados y futuros.
// Los datos salen de Supabase PostgreSQL mediante EF Core; no se exponen credenciales.
app.MapGet("/api/events",async(JujuyDbContext db,TimeProvider clock,CancellationToken ct)=>
{
    var now=clock.GetUtcNow();
    var published=await db.Events.AsNoTracking()
        .Where(e=>e.Published&&!e.IsDemo&&e.StartsAtUtc>=now)
        .OrderBy(e=>e.StartsAtUtc)
        .Take(100)
        .Select(e=>new{
            e.Id,e.Title,e.Location,e.StartsAtUtc,e.DurationMinutes,e.Description,e.Category,e.AdmissionInfo,e.ImageUrl,e.SourceUrl,e.VisitorTip,e.Organizer,e.Latitude,e.Longitude,e.GeoSource
        })
        .ToListAsync(ct);
    return Results.Ok(published);
});
app.MapPost("/api/attendances",async(RegisterAttendanceRequest request,RegisterAttendanceService service,CancellationToken ct)=>
{
    try
    {
        var outcome=await service.RegisterAsync(request,ct);
        return Results.Json(new {message=outcome.Message},statusCode:outcome.StatusCode);
    }
    catch(DbUpdateException){return Results.Conflict(new {message="No se pudo registrar una nueva solicitud. Comprobá si ya estás inscripto."});}
}).RequireRateLimiting("registrations");
// Protected endpoint: schedule from Supabase Cron (pg_net) or another trusted scheduler.
app.MapPost("/internal/jobs/send-reminders",async(HttpRequest request,ReminderDispatcher dispatcher,IConfiguration config,CancellationToken ct)=>
{
    var expected=config["Job:Secret"];
    if(string.IsNullOrWhiteSpace(expected)||!request.Headers.TryGetValue("X-Job-Key",out var provided))
        return Results.Unauthorized();
    var sent=Encoding.UTF8.GetBytes(provided.ToString());var known=Encoding.UTF8.GetBytes(expected);
    if(sent.Length!=known.Length||!CryptographicOperations.FixedTimeEquals(sent,known))return Results.Unauthorized();
    var count=await dispatcher.DispatchDueAsync(ct);
    return Results.Ok(new {processed=count});
});
app.MapGet("/health",()=>Results.Ok(new {status="ok"}));
app.Run();
