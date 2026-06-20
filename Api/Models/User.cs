using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    public class User
    {
        [Key]
        [Column("user_id")]
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}