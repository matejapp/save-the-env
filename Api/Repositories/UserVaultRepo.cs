using Api.Models;
using Api.Repositories.Interfaces;
using Api.Shared;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class UserVaultRepo : IUserVaultRepo
    {
        private readonly ApplicationDbContext _context;
        public UserVaultRepo(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserVault> CreateAsync(UserVault vault)
        {
            await _context.UserVaults.AddAsync(vault);
            await _context.SaveChangesAsync();
            return vault;
        }

        public async Task<UserVault?> GetByUserIdAsync(Guid userId)
        {
            return await _context.UserVaults.FirstOrDefaultAsync(v => v.UserId == userId);
        }

        public async Task<UserVault> UpdateAsync(UserVault vault)
        {
            _context.UserVaults.Update(vault);
            await _context.SaveChangesAsync();
            return vault;
        }
    }
}
