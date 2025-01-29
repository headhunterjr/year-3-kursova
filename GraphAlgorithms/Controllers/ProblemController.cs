using GraphAlgorithms.Models;
using GraphAlgorithms.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace GraphAlgorithms.Controllers
{
    public struct Algorithms
    {
        public const string Dijkstra = "Dijkstra";
        public const string Prim = "Prim";
        public const string Floyd = "Floyd";
    }
    public class ProblemController : Controller
    {
        private readonly IProblemRepository _problemRepository;

        public ProblemController(IProblemRepository problemRepository)
        {
            _problemRepository = problemRepository ?? throw new ArgumentNullException(nameof(problemRepository));
        }

        [HttpPost]
        public async Task<IActionResult> SolveDijkstra(IFormFile excelFile, int sourceVertex)
        {
            if (excelFile == null || excelFile.Length == 0)
            {
                return BadRequest("Неналежний формат файлу.");
            }

            try
            {
                int[,] matrix = _problemRepository.ReadExcelToMatrix(excelFile);
                if (sourceVertex < 0 || sourceVertex >= matrix.GetLength(0))
                {
                    return BadRequest("Введіть дійсну початкову вершину.");
                }
                if (Validation.ValidateUndirectedGraph(matrix))
                {
                    int[] result = _problemRepository.Dijkstra(matrix, sourceVertex);
                    Problem problem = new Problem
                    {
                        Algorithm = Algorithms.Dijkstra,
                        DataSize = matrix.GetLength(0),
                        ExcelUsed = true,
                        TimeOfIssue = DateTime.UtcNow,
                        Status = "Completed",
                    };
                    await _problemRepository.AddProblemAsync(problem);
                    return Ok(result);
                }
                else
                {
                    throw new InvalidOperationException("Недійсні дані.");
                }
            }
            catch (FormatException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, "Під час оброблення файлу сталася помилка.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> SolveFloyd(IFormFile excelFile)
        {
            if (excelFile == null || excelFile.Length == 0)
            {
                return BadRequest("Неналежний формат файлу.");
            }

            try
            {
                int[,] matrix = _problemRepository.ReadExcelToMatrix(excelFile);
                if (Validation.ValidateDirectedGraph(matrix))
                {
                    int[,] result = _problemRepository.Floyd(matrix);
                    Problem problem = new Problem
                    {
                        Algorithm = Algorithms.Floyd,
                        DataSize = matrix.GetLength(0),
                        ExcelUsed = true,
                        TimeOfIssue = DateTime.UtcNow,
                        Status = "Completed",
                    };
                    await _problemRepository.AddProblemAsync(problem);
                    return Ok(result);
                }
                else
                {
                    throw new InvalidOperationException("Недійсні дані.");
                }
            }
            catch (FormatException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, "Під час оброблення файлу сталася помилка.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> SolvePrim(IFormFile excelFile, int sourceVertex)
        {
            if (excelFile == null || excelFile.Length == 0)
            {
                return BadRequest("Неналежний формат файлу.");
            }

            try
            {
                int[,] matrix = _problemRepository.ReadExcelToMatrix(excelFile);
                if (sourceVertex < 0 || sourceVertex >= matrix.GetLength(0))
                {
                    return BadRequest("Введіть дійсну початкову вершину.");
                }
                if (Validation.ValidateUndirectedGraph(matrix))
                {
                    List<(int, int, int)> result = _problemRepository.Prim(matrix, sourceVertex);
                    Problem problem = new Problem
                    {
                        Algorithm = Algorithms.Prim,
                        DataSize = matrix.GetLength(0),
                        ExcelUsed = true,
                        TimeOfIssue = DateTime.UtcNow,
                        Status = "Completed",
                    };
                    await _problemRepository.AddProblemAsync(problem);

                    var mstEdges = result.Select(edge => new
                    {
                        Source = edge.Item1,
                        Destination = edge.Item2,
                        Weight = edge.Item3
                    }).OrderBy(edge => edge.Source).ToList();

                    return Ok(new { originalMatrix = matrix, mstEdges });
                }
                else
                {
                    throw new InvalidOperationException("Недійсні дані.");
                }
            }
            catch (FormatException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, "Під час оброблення файлу сталася помилка.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> SolveFloydManual([FromForm] int?[][] matrix)
        {
            try
            {
                if (matrix == null || matrix.Length == 0)
                {
                    return BadRequest("Матриця не може бути порожньою.");
                }

                int[,] processedMatrix = new int[matrix.Length, matrix.Length];
                for (int i = 0; i < matrix.Length; i++)
                {
                    for (int j = 0; j < matrix[i].Length; j++)
                    {
                        processedMatrix[i, j] = matrix[i][j] ?? int.MaxValue;
                    }
                }

                if (Validation.ValidateDirectedGraph(processedMatrix))
                {
                    var result = _problemRepository.Floyd(processedMatrix);
                    Problem problem = new Problem
                    {
                        Algorithm = Algorithms.Floyd,
                        DataSize = processedMatrix.GetLength(0),
                        ExcelUsed = false,
                        TimeOfIssue = DateTime.UtcNow,
                        Status = "Completed",
                    };
                    await _problemRepository.AddProblemAsync(problem);
                    return Ok(result);
                }
                else
                {
                    throw new InvalidOperationException("Недійсні дані.");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, $"Сталася помилка. Перевірте дані та спробуйте ще раз.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> SolveDijkstraManual([FromForm] int?[][] matrix, int sourceVertex)
        {
            try
            {
                if (matrix == null || matrix.Length == 0)
                {
                    return BadRequest("Матриця не може бути порожньою.");
                }

                if (sourceVertex < 0 || sourceVertex >= matrix.GetLength(0))
                {
                    return BadRequest("Введіть дійсну початкову вершину.");
                }

                int[,] processedMatrix = new int[matrix.Length, matrix.Length];
                for (int i = 0; i < matrix.Length; i++)
                {
                    for (int j = 0; j < matrix[i].Length; j++)
                    {
                        processedMatrix[i, j] = matrix[i][j] ?? int.MaxValue;
                    }
                }

                if (Validation.ValidateUndirectedGraph(processedMatrix))
                {
                    var result = _problemRepository.Dijkstra(processedMatrix, sourceVertex);
                    Problem problem = new Problem
                    {
                        Algorithm = Algorithms.Dijkstra,
                        DataSize = processedMatrix.GetLength(0),
                        ExcelUsed = false,
                        TimeOfIssue = DateTime.UtcNow,
                        Status = "Completed",
                    };
                    await _problemRepository.AddProblemAsync(problem);
                    return Ok(result);
                }
                else
                {
                    throw new InvalidOperationException("Недійсні дані.");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, $"Сталася помилка. Перевірте дані та спробуйте ще раз.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> SolvePrimManual([FromForm] int?[][] matrix, int sourceVertex)
        {
            try
            {
                if (matrix == null || matrix.Length == 0)
                {
                    return BadRequest("Матриця не може бути порожньою.");
                }

                if (sourceVertex < 0 || sourceVertex >= matrix.GetLength(0))
                {
                    return BadRequest("Введіть дійсну початкову вершину.");
                }

                int[,] processedMatrix = new int[matrix.Length, matrix.Length];
                for (int i = 0; i < matrix.Length; i++)
                {
                    for (int j = 0; j < matrix[i].Length; j++)
                    {
                        processedMatrix[i, j] = matrix[i][j] ?? int.MaxValue;
                    }
                }

                if (Validation.ValidateUndirectedGraph(processedMatrix))
                {
                    List<(int, int, int)> result = _problemRepository.Prim(processedMatrix, sourceVertex);
                    Problem problem = new Problem
                    {
                        Algorithm = Algorithms.Prim,
                        DataSize = processedMatrix.GetLength(0),
                        ExcelUsed = false,
                        TimeOfIssue = DateTime.UtcNow,
                        Status = "Completed",
                    };
                    await _problemRepository.AddProblemAsync(problem);

                    var mstEdges = result.Select(edge => new
                    {
                        Source = edge.Item1,
                        Destination = edge.Item2,
                        Weight = edge.Item3
                    }).OrderBy(edge => edge.Source).ToList();

                    return Ok(new { originalMatrix = matrix, mstEdges });
                }
                else
                {
                    throw new InvalidOperationException("Недійсні дані.");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, $"Сталася помилка. Перевірте дані та спробуйте ще раз.");
            }
        }

        public IActionResult Dijkstra()
        {
            return View();
        }

        public IActionResult Floyd()
        {
            return View();
        }

        public IActionResult Prim()
        {
            return View();
        }
    }
}
