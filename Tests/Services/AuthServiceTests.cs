using Api.Dto.User;
using Api.Exceptions;
using Xunit;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Services;
using Api.Services.Interfaces;
using FluentAssertions;
using Moq;

namespace Api.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IAuthRepo> _authRepo = new();
    private readonly Mock<IJwtTokenService> _jwtTokenService = new();
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _sut = new AuthService(_authRepo.Object, _jwtTokenService.Object);
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailAlreadyExists_ThrowsConflictException()
    {
        _authRepo.Setup(r => r.EmailExistsAsync("test@example.com")).ReturnsAsync(true);

        var act = () => _sut.RegisterAsync(new RegisterRequestDto { Email = "test@example.com", Password = "pass" });

        await act.Should().ThrowAsync<ConflictException>().WithMessage("Email is already in use.");
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailIsNew_CreatesUserAndReturnsToken()
    {
        _authRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _authRepo.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);
        _jwtTokenService.Setup(j => j.GenerateJwtToken(It.IsAny<User>())).Returns("jwt-token");

        var result = await _sut.RegisterAsync(new RegisterRequestDto { Email = "new@example.com", Password = "secret" });

        result.Should().Be("jwt-token");
        _authRepo.Verify(r => r.CreateAsync(It.Is<User>(u => u.Email == "new@example.com")), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailIsNew_HashesPassword()
    {
        _authRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        User? captured = null;
        _authRepo.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .Callback<User>(u => captured = u)
            .ReturnsAsync((User u) => u);
        _jwtTokenService.Setup(j => j.GenerateJwtToken(It.IsAny<User>())).Returns("tok");

        await _sut.RegisterAsync(new RegisterRequestDto { Email = "a@b.com", Password = "plain" });

        captured!.PasswordHash.Should().NotBe("plain");
        BCrypt.Net.BCrypt.Verify("plain", captured.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task LoginAsync_WhenUserNotFound_ThrowsUnauthorizedException()
    {
        _authRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        var act = () => _sut.LoginAsync(new LoginRequestDto { Email = "x@x.com", Password = "p" });

        await act.Should().ThrowAsync<UnauthorizedException>().WithMessage("Invalid credentials.");
    }

    [Fact]
    public async Task LoginAsync_WhenPasswordIsWrong_ThrowsUnauthorizedException()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct") };
        _authRepo.Setup(r => r.GetByEmailAsync("a@b.com")).ReturnsAsync(user);

        var act = () => _sut.LoginAsync(new LoginRequestDto { Email = "a@b.com", Password = "wrong" });

        await act.Should().ThrowAsync<UnauthorizedException>().WithMessage("Invalid credentials.");
    }

    [Fact]
    public async Task LoginAsync_WhenCredentialsAreValid_ReturnsToken()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("secret") };
        _authRepo.Setup(r => r.GetByEmailAsync("a@b.com")).ReturnsAsync(user);
        _jwtTokenService.Setup(j => j.GenerateJwtToken(user)).Returns("valid-token");

        var result = await _sut.LoginAsync(new LoginRequestDto { Email = "a@b.com", Password = "secret" });

        result.Should().Be("valid-token");
    }
}
