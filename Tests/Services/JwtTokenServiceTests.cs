using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Api.Models;
using Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Api.Tests.Services;

public class JwtTokenServiceTests
{
    private readonly JwtTokenService _sut;

    public JwtTokenServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super-secret-key-that-is-long-enough-for-hmac256"
            })
            .Build();

        _sut = new JwtTokenService(config);
    }

    [Fact]
    public void GenerateJwtToken_ReturnsNonEmptyString()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "user@test.com" };

        var token = _sut.GenerateJwtToken(user);

        token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void GenerateJwtToken_ReturnsValidJwtFormat()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "user@test.com" };

        var token = _sut.GenerateJwtToken(user);

        // JWT format: header.payload.signature
        token.Split('.').Should().HaveCount(3);
    }

    [Fact]
    public void GenerateJwtToken_ContainsEmailClaim()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "user@test.com" };

        var token = _sut.GenerateJwtToken(user);

        var handler = new JwtSecurityTokenHandler();
        var parsed = handler.ReadJwtToken(token);
        parsed.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "user@test.com");
    }

    [Fact]
    public void GenerateJwtToken_ContainsNameIdentifierClaim()
    {
        var userId = Guid.NewGuid();
        var user = new User { Id = userId, Email = "user@test.com" };

        var token = _sut.GenerateJwtToken(user);

        var handler = new JwtSecurityTokenHandler();
        var parsed = handler.ReadJwtToken(token);
        parsed.Claims.Should().Contain(c =>
            c.Type == ClaimTypes.NameIdentifier && c.Value == userId.ToString());
    }

    [Fact]
    public void GenerateJwtToken_TokenExpiresIn30Minutes()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "user@test.com" };

        var before = DateTime.UtcNow;
        var token = _sut.GenerateJwtToken(user);
        var after = DateTime.UtcNow;

        var handler = new JwtSecurityTokenHandler();
        var parsed = handler.ReadJwtToken(token);

        parsed.ValidTo.Should().BeCloseTo(before.AddMinutes(30), TimeSpan.FromSeconds(10));
    }
}
