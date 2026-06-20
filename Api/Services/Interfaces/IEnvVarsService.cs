using Api.Dto.EnvVars;
using Api.Models;

namespace Api.Services.Interfaces
{
    public interface IEnvVarsService
    {
        Task<EnvVars> CreateAsync(CreateEnvVarDto dto);
        Task<IEnumerable<EnvVars>> GetAllByProjectIdAsync(Guid projectId);
        Task<EnvVars> UpdateAsync(Guid envId, UpdateEnvVarDto dto);
        Task DeleteAsync(Guid envId);
    }
}
