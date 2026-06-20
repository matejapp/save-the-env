using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    public class Project
    {
        [Key]
        [Column("project_id")]
        public Guid Id { get; set; }
        public string? Name { get; set; }
        [ForeignKey("User")]
        [Column("user_id")]
        public Guid UserId { get; set; }
        public User? User { get; set; }
    }
}
