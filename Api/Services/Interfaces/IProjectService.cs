using Api.Dto.Project;
using Api.Models;

namespace Api.Services.Interfaces
{
    public interface IProjectService
    {
        Task<Project> CreateProjectAsync(ProjectRequestDto dto, Guid userId);
        Task<Project> GetAsync(Guid projectId);
        Task<IEnumerable<Project>> GetAllByUserIdAsync(Guid userId);
        Task DeleteAsync(Guid projectId);
    }
}