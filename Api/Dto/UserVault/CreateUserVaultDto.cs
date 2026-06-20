namespace Api.Dto.UserVault
{
    public class CreateUserVaultDto
    {
        public string? CanaryValue { get; set; }
        public string? KdfSalt { get; set; }
    }
}
