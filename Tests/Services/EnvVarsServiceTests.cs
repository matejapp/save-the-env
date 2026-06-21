using Api.Dto.EnvVars;
using Api.Exceptions;
using Xunit;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Services;
using FluentAssertions;
using Moq;

namespace Api.Tests.Services;

public class EnvVarsServiceTests
{
    private readonly Mock<IEnvVarsRepo> _repo = new();
    private readonly EnvVarsService _sut;

    public EnvVarsServiceTests()
    {
        _sut = new EnvVarsService(_repo.Object);
    }

    [Fact]
    public async Task CreateAsync_CreatesEnvVarWithCorrectFields()
    {
        var projectId = Guid.NewGuid();
        var dto = new CreateEnvVarDto { Key = "DB_URL", EncryptedValue = "enc-val", ProjectId = projectId };
        _repo.Setup(r => r.CreateAsync(It.IsAny<EnvVars>())).ReturnsAsync((EnvVars e) => e);

        var result = await _sut.CreateAsync(dto);

        result.Key.Should().Be("DB_URL");
        result.EncryptedValue.Should().Be("enc-val");
        result.ProjectId.Should().Be(projectId);
        result.Id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetAllByProjectIdAsync_ReturnsEnvVarsFromRepo()
    {
        var projectId = Guid.NewGuid();
        var envVars = new List<EnvVars> { new() { Id = Guid.NewGuid(), Key = "X", ProjectId = projectId } };
        _repo.Setup(r => r.GetAllByProjectIdAsync(projectId)).ReturnsAsync(envVars);

        var result = await _sut.GetAllByProjectIdAsync(projectId);

        result.Should().BeEquivalentTo(envVars);
    }

    [Fact]
    public async Task UpdateAsync_WhenEnvVarNotFound_ThrowsNotFoundException()
    {
        var envId = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(envId)).ReturnsAsync((EnvVars?)null);

        var act = () => _sut.UpdateAsync(envId, new UpdateEnvVarDto { Key = "NEW" });

        await act.Should().ThrowAsync<NotFoundException>().WithMessage("Env var not found.");
    }

    [Fact]
    public async Task UpdateAsync_WhenKeyProvided_UpdatesKey()
    {
        var envId = Guid.NewGuid();
        var existing = new EnvVars { Id = envId, Key = "OLD", EncryptedValue = "val" };
        _repo.Setup(r => r.GetByIdAsync(envId)).ReturnsAsync(existing);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<EnvVars>())).ReturnsAsync((EnvVars e) => e);

        var result = await _sut.UpdateAsync(envId, new UpdateEnvVarDto { Key = "NEW" });

        result.Key.Should().Be("NEW");
        result.EncryptedValue.Should().Be("val");
    }

    [Fact]
    public async Task UpdateAsync_WhenEncryptedValueProvided_UpdatesEncryptedValue()
    {
        var envId = Guid.NewGuid();
        var existing = new EnvVars { Id = envId, Key = "K", EncryptedValue = "old-enc" };
        _repo.Setup(r => r.GetByIdAsync(envId)).ReturnsAsync(existing);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<EnvVars>())).ReturnsAsync((EnvVars e) => e);

        var result = await _sut.UpdateAsync(envId, new UpdateEnvVarDto { EncryptedValue = "new-enc" });

        result.EncryptedValue.Should().Be("new-enc");
        result.Key.Should().Be("K");
    }

    [Fact]
    public async Task DeleteAsync_DelegatesDeleteToRepo()
    {
        var envId = Guid.NewGuid();
        _repo.Setup(r => r.DeleteAsync(envId)).Returns(Task.CompletedTask);

        await _sut.DeleteAsync(envId);

        _repo.Verify(r => r.DeleteAsync(envId), Times.Once);
    }
}
