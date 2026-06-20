namespace Api.Dto.EnvVars
{
    public class CreateEnvVarDto
    {
        public string? Key { get; set; }
        public string? EncryptedValue { get; set; }
        public Guid ProjectId { get; set; }
    }
}
