using Api.Dto.Project;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;

namespace Api.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepo _repo;
        public ProjectService(IProjectRepo projectRepo)
        {
            _repo = projectRepo;
        }

        public async Task<Project> CreateProjectAsync(ProjectRequestDto dto, Guid userId)
        {
            var project = new Project
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                UserId = userId
            };
            return await _repo.CreateAsync(project);
        }

        public async Task<Project> GetAsync(Guid projectId)
        {
            return await _repo.GetAsync(projectId);
        }

        public async Task<IEnumerable<Project>> GetAllByUserIdAsync(Guid userId)
        {
            return await _repo.GetAllByUserIdAsync(userId);
        }

        public async Task DeleteAsync(Guid projectId)
        {
            await _repo.DeleteAsync(projectId);
        }
    }
}