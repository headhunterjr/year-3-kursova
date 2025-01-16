namespace GraphAlgorithms.Models
{
    public interface IProblemRepository
    {
        public Task<int> AddProblemAsync(Problem problem);
        public int[,] ReadExcelToMatrix(IFormFile excelFile);
        public int[] Dijkstra(int[,] graph, int sourceVertex);
        public int[,] Floyd(int[,] graph, int sourceVertex, int endVertex);
        public List<(int, int, int)> Prim(int[,] graph, int sourceVertex);
    }
}
