using Api.Dto.UserVault;
using Api.Models;

namespace Api.Services.Interfaces
{
    public interface IUserVaultService
    {
        Task<UserVault> CreateAsync(CreateUserVaultDto dto, Guid userId);
        Task<UserVault?> GetByUserIdAsync(Guid userId);
        Task<UserVault> UpdateAsync(Guid userId, UpdateUserVaultDto dto);
    }
}
