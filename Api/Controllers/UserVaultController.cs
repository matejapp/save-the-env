using System.Security.Claims;
using Api.Dto.UserVault;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Api.Controllers
{
    [ApiController]
    [Authorize]
    [EnableRateLimiting("sliding")]
    [Route("api/[controller]")]
    public class UserVaultController : ControllerBase
    {
        private readonly IUserVaultService _userVaultService;
        public UserVaultController(IUserVaultService userVaultService)
        {
            _userVaultService = userVaultService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserVaultDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var vault = await _userVaultService.CreateAsync(dto, userId);
            return Ok(vault);
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var vault = await _userVaultService.GetByUserIdAsync(userId);
            if (vault == null) return NotFound();
            return Ok(vault);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateUserVaultDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var vault = await _userVaultService.UpdateAsync(userId, dto);
            return Ok(vault);
        }
    }
}
