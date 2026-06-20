using Microsoft.EntityFrameworkCore;
using Api.Models;

namespace Api.Shared
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<EnvVars> EnvVars { get; set; }
        public DbSet<UserVault> UserVaults { get; set; }
    }

    
}