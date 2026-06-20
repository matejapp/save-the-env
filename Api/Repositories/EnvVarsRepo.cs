using Api.Exceptions;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Shared;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class EnvVarsRepo : IEnvVarsRepo
    {
        private readonly ApplicationDbContext _context;
        public EnvVarsRepo(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<EnvVars> CreateAsync(EnvVars envVar)
        {
            await _context.EnvVars.AddAsync(envVar);
            await _context.SaveChangesAsync();
            return envVar;
        }

        public async Task<EnvVars?> GetByIdAsync(Guid envId)
        {
            return await _context.EnvVars.FindAsync(envId);
        }

        public async Task<IEnumerable<EnvVars>> GetAllByProjectIdAsync(Guid projectId)
        {
            return await _context.EnvVars
                .Where(e => e.ProjectId == projectId)
                .ToListAsync();
        }

        public async Task<EnvVars> UpdateAsync(EnvVars envVar)
        {
            _context.EnvVars.Update(envVar);
            await _context.SaveChangesAsync();
            return envVar;
        }

        public async Task DeleteAsync(Guid envId)
        {
            var envVar = await _context.EnvVars.FindAsync(envId);
            if (envVar == null)
                throw new NotFoundException("Env var not found.");
            _context.EnvVars.Remove(envVar);
            await _context.SaveChangesAsync();
        }
    }
}
