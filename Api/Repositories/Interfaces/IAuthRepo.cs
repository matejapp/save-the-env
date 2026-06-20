using Api.Models;

namespace Api.Repositories.Interfaces
{
    public interface IAuthRepo
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User> CreateAsync(User user);
        Task<bool> EmailExistsAsync(string email);
        
    }
}