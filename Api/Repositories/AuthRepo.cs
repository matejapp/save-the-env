using Api.Models;
using Api.Repositories.Interfaces;
using Api.Shared;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class AuthRepo : IAuthRepo
    {
        private readonly ApplicationDbContext _context;
        public AuthRepo(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email) => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        public async Task<User> CreateAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }
        public Task<bool> EmailExistsAsync(string email)
        {
            return _context.Users.AnyAsync(u => u.Email == email);
        }
        

    }
}