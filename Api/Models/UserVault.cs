using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    public class UserVault
    {
        [Key]
        [Column("user_vault_id")]
        public Guid Id { get; set; }
        public string? CanaryValue { get; set; }
        public string? KdfSalt { get; set; }
        [ForeignKey("User")]
        [Column("user_id")]
        public Guid UserId { get; set; }
        public User? User { get; set; }
    }
}