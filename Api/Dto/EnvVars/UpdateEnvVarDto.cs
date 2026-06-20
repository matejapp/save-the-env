namespace Api.Dto.EnvVars
{
    public class UpdateEnvVarDto
    {
        public string? Key { get; set; }
        public string? EncryptedValue { get; set; }
    }
}
