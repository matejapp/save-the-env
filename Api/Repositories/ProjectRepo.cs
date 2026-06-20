using Api.Exceptions;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Shared;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class ProjectRepo : IProjectRepo
    {
        private readonly ApplicationDbContext _context;
        public ProjectRepo(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Project> CreateAsync(Project project)
        {
            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();
            return project;
        }
        public async Task<Project> GetAsync(Guid projectId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
                throw new NotFoundException("Project not found.");
            return project;
        }

        public async Task<IEnumerable<Project>> GetAllByUserIdAsync(Guid userId)
        {
            return await _context.Projects
                .Where(p => p.UserId == userId)
                .ToListAsync();
        }

        public async Task DeleteAsync(Guid projectId)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
                throw new NotFoundException("Project not found.");
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
        }
    }
}