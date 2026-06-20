using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    public class EnvVars
    {
        [Key]
        [Column("env_id")]
        public Guid Id { get; set; }
        public string? Key { get; set; }
        public string? EncryptedValue { get; set; }
        [ForeignKey("Project")]
        [Column("project_id")]
        public Guid ProjectId { get; set; }
        public Project? Project { get; set; }
    }
}