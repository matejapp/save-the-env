using Api.Dto.EnvVars;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class EnvVarsController : ControllerBase
    {
        private readonly IEnvVarsService _envVarsService;
        public EnvVarsController(IEnvVarsService envVarsService)
        {
            _envVarsService = envVarsService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEnvVarDto dto)
        {
            var envVar = await _envVarsService.CreateAsync(dto);
            return Ok(envVar);
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(Guid projectId)
        {
            var envVars = await _envVarsService.GetAllByProjectIdAsync(projectId);
            return Ok(envVars);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEnvVarDto dto)
        {
            var envVar = await _envVarsService.UpdateAsync(id, dto);
            return Ok(envVar);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _envVarsService.DeleteAsync(id);
            return NoContent();
        }
    }
}
