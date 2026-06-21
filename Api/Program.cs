using Api.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Api.Middleware;
using Api.Services;
using Api.Services.Interfaces;
using Api.Repositories;
using Api.Repositories.Interfaces;

var builder = WebApplication.CreateBuilder(args);

//Controllers
builder.Services.AddControllers();

//Peristence
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("SupabasePostgres"));
});

//Auth
builder.Services.AddAuthorization();
builder.Services.AddAuthentication(cfg =>
{
    cfg.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    cfg.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    cfg.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(bearer =>
{
    bearer.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    bearer.SaveToken = false;
    bearer.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero,
        RequireExpirationTime = true,
        ValidateLifetime = true,
    };
});

// Add services to the container.
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuthRepo, AuthRepo>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectRepo, ProjectRepo>();
builder.Services.AddScoped<IEnvVarsService, EnvVarsService>();
builder.Services.AddScoped<IEnvVarsRepo, EnvVarsRepo>();
builder.Services.AddScoped<IUserVaultService, UserVaultService>();
builder.Services.AddScoped<IUserVaultRepo, UserVaultRepo>();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();


// Configure the HTTP request pipeline.
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();


app.Run();

