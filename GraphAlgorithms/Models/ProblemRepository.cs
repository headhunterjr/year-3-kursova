using GraphAlgorithms.Services;
using OfficeOpenXml;
using System.Diagnostics;

namespace GraphAlgorithms.Models
{
    public class ProblemRepository : IProblemRepository
    {
        public const int INF = int.MaxValue;
        private readonly ProblemDbContext _context;

        public ProblemRepository(ProblemDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<int> AddProblemAsync(Problem problem)
        {
            await _context.Problems.AddAsync(problem);
            return await _context.SaveChangesAsync();
        }

        public int[,] ReadExcelToMatrix(IFormFile excelFile)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var stream = excelFile.OpenReadStream();
            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[0];

            int rows = worksheet.Dimension.Rows;
            int columns = worksheet.Dimension.Columns;

            int[,] matrix = new int[rows, columns];

            for (int i = 1; i <= rows; i++)
            {
                for (int j = 1; j <= columns; j++)
                {
                    if (i == j)
                    {
                        matrix[i - 1, j - 1] = 0;
                    }
                    else if (string.IsNullOrEmpty(worksheet.Cells[i, j].Text))
                    {
                        matrix[i - 1, j - 1] = INF;
                    }
                    else
                    {
                        if (int.TryParse(worksheet.Cells[i, j].Text, out int value))
                        {
                            matrix[i - 1, j - 1] = value;
                        }
                        else
                        {
                            throw new FormatException($"Non-integer value found at cell ({i}, {j}).");
                        }
                    }
                }
            }
            return matrix;
        }

        public int[] Dijkstra(int[,] graph, int sourceVertex)
        {
            int verticesCount = graph.GetLength(0);
            int[] lengths = new int[verticesCount];
            for (int i = 0; i < verticesCount; i++)
            {
                lengths[i] = INF;
            }
            lengths[sourceVertex] = 0;

            bool[] processed = new bool[verticesCount];

            for (int i = 0; i < verticesCount; i++)
            {
                int minDistance = INF;
                int minVertex = -1;

                for (int v = 0; v < verticesCount; v++)
                {
                    if (!processed[v] && lengths[v] < minDistance)
                    {
                        minDistance = lengths[v];
                        minVertex = v;
                    }
                }

                if (minVertex == -1) break;
                processed[minVertex] = true;

                for (int v = 0; v < verticesCount; v++)
                {
                    int weight = graph[minVertex, v];
                    if (weight != INF && lengths[minVertex] + weight < lengths[v])
                    {
                        lengths[v] = lengths[minVertex] + weight;
                    }
                }
            }

            return lengths;
        }
        public int[,] Floyd(int[,] graph, int sourceVertex, int endVertex)
        {
            int verticesCount = graph.GetLength(0);
            int[,] dist = new int[verticesCount, verticesCount];
            for (int i = 0; i < verticesCount; i++)
            {
                for (int j = 0; j < verticesCount; j++)
                {
                    dist[i, j] = graph[i, j];
                }
            }

            for (int k = 0; k < verticesCount; k++)
            {
                for (int i = 0; i < verticesCount; i++)
                {
                    for (int j = 0; j < verticesCount; j++)
                    {
                        if (dist[i, k] != INF && dist[k, j] != INF && dist[i, k] + dist[k, j] < dist[i, j])
                        {
                            dist[i, j] = dist[i, k] + dist[k, j];
                        }
                    }
                }
            }
            return dist;
        }
        public List<(int, int, int)> Prim(int[,] graph, int sourceVertex)
        {
            if (!Validation.ValidateConnectedGraph(graph))
            {
                throw new InvalidOperationException("Graph not fully connected, MST cannot be built.");
            }
            int verticesCount = graph.GetLength(0);
            bool[] visited = new bool[verticesCount];
            int[] keys = new int[verticesCount];
            int[] parents = new int[verticesCount];

            for (int i = 0; i < verticesCount; i++)
            {
                keys[i] = int.MaxValue;
                parents[i] = -1;
            }
            keys[sourceVertex] = 0;

            for (int count = 0; count < verticesCount - 1; count++)
            {
                int u = -1;
                int minKey = int.MaxValue;
                for (int v = 0; v < verticesCount; v++)
                {
                    if (!visited[v] && keys[v] < minKey)
                    {
                        minKey = keys[v];
                        u = v;
                    }
                }

                visited[u] = true;

                for (int v = 0; v < verticesCount; v++)
                {
                    int weight = graph[u, v];
                    if (weight != 0 && !visited[v] && weight < keys[v])
                    {
                        keys[v] = weight;
                        parents[v] = u;
                    }
                }
            }

            List<(int, int, int)> mstEdges = new();
            for (int i = 0; i < verticesCount; i++)
            {
                if (parents[i] != -1)
                {
                    mstEdges.Add((parents[i], i, graph[parents[i], i]));
                }
            }

            return mstEdges;
        }
    }
}
