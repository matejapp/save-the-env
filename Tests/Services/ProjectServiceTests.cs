using Api.Dto.Project;
using Api.Models;
using Xunit;
using Api.Repositories.Interfaces;
using Api.Services;
using FluentAssertions;
using Moq;

namespace Api.Tests.Services;

public class ProjectServiceTests
{
    private readonly Mock<IProjectRepo> _repo = new();
    private readonly ProjectService _sut;

    public ProjectServiceTests()
    {
        _sut = new ProjectService(_repo.Object);
    }

    [Fact]
    public async Task CreateProjectAsync_CreatesProjectWithCorrectFields()
    {
        var userId = Guid.NewGuid();
        var dto = new ProjectRequestDto { Name = "My App" };
        _repo.Setup(r => r.CreateAsync(It.IsAny<Project>())).ReturnsAsync((Project p) => p);

        var result = await _sut.CreateProjectAsync(dto, userId);

        result.Name.Should().Be("My App");
        result.UserId.Should().Be(userId);
        result.Id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetAsync_ReturnsProjectFromRepo()
    {
        var projectId = Guid.NewGuid();
        var project = new Project { Id = projectId, Name = "Test" };
        _repo.Setup(r => r.GetAsync(projectId)).ReturnsAsync(project);

        var result = await _sut.GetAsync(projectId);

        result.Should().BeEquivalentTo(project);
    }

    [Fact]
    public async Task GetAllByUserIdAsync_ReturnsProjectsFromRepo()
    {
        var userId = Guid.NewGuid();
        var projects = new List<Project> { new() { Id = Guid.NewGuid(), UserId = userId } };
        _repo.Setup(r => r.GetAllByUserIdAsync(userId)).ReturnsAsync(projects);

        var result = await _sut.GetAllByUserIdAsync(userId);

        result.Should().BeEquivalentTo(projects);
    }

    [Fact]
    public async Task DeleteAsync_DelegatesDeleteToRepo()
    {
        var projectId = Guid.NewGuid();
        _repo.Setup(r => r.DeleteAsync(projectId)).Returns(Task.CompletedTask);

        await _sut.DeleteAsync(projectId);

        _repo.Verify(r => r.DeleteAsync(projectId), Times.Once);
    }
}
