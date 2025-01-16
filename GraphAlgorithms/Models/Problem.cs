namespace GraphAlgorithms.Models
{
    public class Problem
    {
        public int Id { get; set; }
        public DateTime TimeOfIssue { get; set; }
        public required string Algorithm {  get; set; }
        public int DataSize {  get; set; }
        public bool ExcelUsed {  get; set; }
        public string? Status {  get; set; }
    }
}
