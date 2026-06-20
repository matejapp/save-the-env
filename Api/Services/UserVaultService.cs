using Api.Dto.UserVault;
using Api.Exceptions;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;

namespace Api.Services
{
    public class UserVaultService : IUserVaultService
    {
        private readonly IUserVaultRepo _repo;
        public UserVaultService(IUserVaultRepo repo)
        {
            _repo = repo;
        }

        public async Task<UserVault> CreateAsync(CreateUserVaultDto dto, Guid userId)
        {
            var vault = new UserVault
            {
                Id = Guid.NewGuid(),
                CanaryValue = dto.CanaryValue,
                KdfSalt = dto.KdfSalt,
                UserId = userId
            };
            return await _repo.CreateAsync(vault);
        }

        public async Task<UserVault?> GetByUserIdAsync(Guid userId)
        {
            return await _repo.GetByUserIdAsync(userId);
        }

        public async Task<UserVault> UpdateAsync(Guid userId, UpdateUserVaultDto dto)
        {
            var vault = await _repo.GetByUserIdAsync(userId)
                ?? throw new NotFoundException("User vault not found.");

            if (dto.CanaryValue != null) vault.CanaryValue = dto.CanaryValue;
            if (dto.KdfSalt != null) vault.KdfSalt = dto.KdfSalt;

            return await _repo.UpdateAsync(vault);
        }
    }
}
