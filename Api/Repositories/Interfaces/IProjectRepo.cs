using Api.Models;

namespace Api.Repositories.Interfaces
{
    public interface IProjectRepo
    {
        Task<Project> CreateAsync(Project project);
        Task<Project> GetAsync(Guid projectId);
        Task<IEnumerable<Project>> GetAllByUserIdAsync(Guid userId);
        Task DeleteAsync(Guid projectId);
    }
}