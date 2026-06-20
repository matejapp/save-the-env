using Api.Dto.EnvVars;
using Api.Exceptions;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;

namespace Api.Services
{
    public class EnvVarsService : IEnvVarsService
    {
        private readonly IEnvVarsRepo _repo;
        public EnvVarsService(IEnvVarsRepo repo)
        {
            _repo = repo;
        }

        public async Task<EnvVars> CreateAsync(CreateEnvVarDto dto)
        {
            var envVar = new EnvVars
            {
                Id = Guid.NewGuid(),
                Key = dto.Key,
                EncryptedValue = dto.EncryptedValue,
                ProjectId = dto.ProjectId
            };
            return await _repo.CreateAsync(envVar);
        }

        public async Task<IEnumerable<EnvVars>> GetAllByProjectIdAsync(Guid projectId)
        {
            return await _repo.GetAllByProjectIdAsync(projectId);
        }

        public async Task<EnvVars> UpdateAsync(Guid envId, UpdateEnvVarDto dto)
        {
            var envVar = await _repo.GetByIdAsync(envId)
                ?? throw new NotFoundException("Env var not found.");

            if (dto.Key != null) envVar.Key = dto.Key;
            if (dto.EncryptedValue != null) envVar.EncryptedValue = dto.EncryptedValue;

            return await _repo.UpdateAsync(envVar);
        }

        public async Task DeleteAsync(Guid envId)
        {
            await _repo.DeleteAsync(envId);
        }
    }
}
