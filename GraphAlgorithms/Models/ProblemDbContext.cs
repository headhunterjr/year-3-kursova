using Microsoft.EntityFrameworkCore;

namespace GraphAlgorithms.Models
{
    public class ProblemDbContext : DbContext
    {
        public ProblemDbContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Problem> Problems { get; set; }
    }
}
