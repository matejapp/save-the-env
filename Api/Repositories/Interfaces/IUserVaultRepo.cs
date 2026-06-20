using Api.Models;

namespace Api.Repositories.Interfaces
{
    public interface IUserVaultRepo
    {
        Task<UserVault> CreateAsync(UserVault vault);
        Task<UserVault?> GetByUserIdAsync(Guid userId);
        Task<UserVault> UpdateAsync(UserVault vault);
    }
}
