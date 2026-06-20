using Api.Dto.User;
using Api.Models;

using Api.Repositories.Interfaces;
using Api.Services.Interfaces;

namespace Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepo _authRepo;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthService(IAuthRepo authRepo, IJwtTokenService jwtTokenService)
        {
            _authRepo = authRepo;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<string> RegisterAsync(RegisterRequestDto dto)
        {
            if (await _authRepo.EmailExistsAsync(dto.Email))
                throw new InvalidOperationException("Email is already in use.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _authRepo.CreateAsync(user);

            return _jwtTokenService.GenerateJwtToken(user);
        }

        public async Task<string> LoginAsync(LoginRequestDto dto)
        {
            var user = await _authRepo.GetByEmailAsync(dto.Email)
                ?? throw new UnauthorizedAccessException("Invalid credentials.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials.");

            return _jwtTokenService.GenerateJwtToken(user);
        }
    }
}
