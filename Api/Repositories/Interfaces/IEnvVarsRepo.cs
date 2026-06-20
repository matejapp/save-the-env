using Api.Models;

namespace Api.Repositories.Interfaces
{
    public interface IEnvVarsRepo
    {
        Task<EnvVars> CreateAsync(EnvVars envVar);
        Task<EnvVars?> GetByIdAsync(Guid envId);
        Task<IEnumerable<EnvVars>> GetAllByProjectIdAsync(Guid projectId);
        Task<EnvVars> UpdateAsync(EnvVars envVar);
        Task DeleteAsync(Guid envId);
    }
}
