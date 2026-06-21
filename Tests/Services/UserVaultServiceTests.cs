using Api.Dto.UserVault;
using Api.Exceptions;
using Xunit;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Services;
using FluentAssertions;
using Moq;

namespace Api.Tests.Services;

public class UserVaultServiceTests
{
    private readonly Mock<IUserVaultRepo> _repo = new();
    private readonly UserVaultService _sut;

    public UserVaultServiceTests()
    {
        _sut = new UserVaultService(_repo.Object);
    }

    [Fact]
    public async Task CreateAsync_CreatesVaultWithCorrectFields()
    {
        var userId = Guid.NewGuid();
        var dto = new CreateUserVaultDto { CanaryValue = "canary", KdfSalt = "salt123" };
        _repo.Setup(r => r.CreateAsync(It.IsAny<UserVault>())).ReturnsAsync((UserVault v) => v);

        var result = await _sut.CreateAsync(dto, userId);

        result.CanaryValue.Should().Be("canary");
        result.KdfSalt.Should().Be("salt123");
        result.UserId.Should().Be(userId);
        result.Id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetByUserIdAsync_ReturnsVaultFromRepo()
    {
        var userId = Guid.NewGuid();
        var vault = new UserVault { Id = Guid.NewGuid(), UserId = userId };
        _repo.Setup(r => r.GetByUserIdAsync(userId)).ReturnsAsync(vault);

        var result = await _sut.GetByUserIdAsync(userId);

        result.Should().BeEquivalentTo(vault);
    }

    [Fact]
    public async Task GetByUserIdAsync_WhenNotFound_ReturnsNull()
    {
        _repo.Setup(r => r.GetByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync((UserVault?)null);

        var result = await _sut.GetByUserIdAsync(Guid.NewGuid());

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_WhenVaultNotFound_ThrowsNotFoundException()
    {
        var userId = Guid.NewGuid();
        _repo.Setup(r => r.GetByUserIdAsync(userId)).ReturnsAsync((UserVault?)null);

        var act = () => _sut.UpdateAsync(userId, new UpdateUserVaultDto { CanaryValue = "c" });

        await act.Should().ThrowAsync<NotFoundException>().WithMessage("User vault not found.");
    }

    [Fact]
    public async Task UpdateAsync_WhenCanaryValueProvided_UpdatesCanaryValue()
    {
        var userId = Guid.NewGuid();
        var existing = new UserVault { Id = Guid.NewGuid(), UserId = userId, CanaryValue = "old", KdfSalt = "s" };
        _repo.Setup(r => r.GetByUserIdAsync(userId)).ReturnsAsync(existing);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<UserVault>())).ReturnsAsync((UserVault v) => v);

        var result = await _sut.UpdateAsync(userId, new UpdateUserVaultDto { CanaryValue = "new" });

        result.CanaryValue.Should().Be("new");
        result.KdfSalt.Should().Be("s");
    }

    [Fact]
    public async Task UpdateAsync_WhenKdfSaltProvided_UpdatesKdfSalt()
    {
        var userId = Guid.NewGuid();
        var existing = new UserVault { Id = Guid.NewGuid(), UserId = userId, CanaryValue = "c", KdfSalt = "old-salt" };
        _repo.Setup(r => r.GetByUserIdAsync(userId)).ReturnsAsync(existing);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<UserVault>())).ReturnsAsync((UserVault v) => v);

        var result = await _sut.UpdateAsync(userId, new UpdateUserVaultDto { KdfSalt = "new-salt" });

        result.KdfSalt.Should().Be("new-salt");
        result.CanaryValue.Should().Be("c");
    }
}
