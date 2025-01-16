namespace GraphAlgorithms.Services
{
    public class Validation
    {
        public static bool ValidateUndirectedGraph(int[,] graph)
        {
            if (graph.GetLength(0) != graph.GetLength(1)) return false;
            for (int i = 0; i < graph.GetLength(0); ++i)
            {
                if (graph[i, i] != 0) return false;
                for (int j = 0; j < graph.GetLength(1); ++j)
                {
                    if (graph[i, j] != graph[j, i]) return false;
                }
            }
            return true;
        }

        public static bool ValidateDirectedGraph(int[,] graph)
        {
            if (graph.GetLength(0) != graph.GetLength(1)) return false;
            for (int i = 0; i < graph.GetLength(0); ++i)
            {
                if (graph[i, i] != 0) return false;
            }
            return true;
        }

        public static bool ValidateConnectedGraph(int[,] graph)
        {
            int verticesCount = graph.GetLength(0);
            bool[] visited = new bool[verticesCount];

            void DFS(int vertex)
            {
                visited[vertex] = true;
                for (int i = 0; i < verticesCount; i++)
                {
                    if (graph[vertex, i] != 0 && !visited[i])
                    {
                        DFS(i);
                    }
                }
            }

            DFS(0);
            for (int i = 0; i < verticesCount; i++)
            {
                if (!visited[i])
                {
                    return false;
                }
            }
            return true;
        }
    }
}
