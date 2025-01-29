document.addEventListener('DOMContentLoaded', () => {
    const inputMethod = document.getElementById('inputMethod');
    const excelForm = document.getElementById('excelForm');
    const manualMatrixForm = document.getElementById('manualMatrixForm');
    const matrixSizeInput = document.getElementById('matrixSize');
    const generateMatrixBtn = document.getElementById('generateMatrix');
    const manualForm = document.getElementById('manualForm');
    const matrixInputsDiv = document.getElementById('matrixInputs');
    const resultDiv = document.getElementById('result');

    inputMethod.addEventListener('change', () => {
        resultDiv.innerHTML = '';
        const method = inputMethod.value;
        excelForm.style.display = method === 'excel' ? 'block' : 'none';
        manualMatrixForm.style.display = method === 'manual' ? 'block' : 'none';
    });

    document.querySelector('input[type="file"]').addEventListener('change', function (e) {
        const fileName = e.target.files[0]?.name || 'Файл не обрано';
        document.querySelector('.file-name').textContent = fileName;
    });

    excelForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = excelForm.querySelector('button[type="submit"]');
        let originalButtonText = "";
        if (submitButton) {
            submitButton.disabled = true;
            originalButtonText = submitButton.textContent;
            submitButton.textContent = "Зачекайте...";
        }
        const formData = new FormData(excelForm);

        try {
            const response = await fetch(excelForm.action, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                renderResult(data);
            } else {
                const error = await response.text();
                resultDiv.innerHTML = `<p>${error}</p>`;
            }
        } catch (err) {
            console.error('JavaScript error:', err);
            resultDiv.innerHTML = `<p>${err.message}</p>`;
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });

    generateMatrixBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const size = parseInt(matrixSizeInput.value);
        if (isNaN(size) || size <= 1) {
            alert('Будь ласка, введіть дійсну кількість вершин.');
            return;
        }

        matrixInputsDiv.innerHTML = '';
        manualForm.style.display = 'block';

        let html = '<table class="matrix-input-table" style="border-collapse: collapse; text-align: center;">';
        html += '<thead><tr><th>Вершини</th>';
        for (let i = 0; i < size; i++) {
            html += `<th>${i}</th>`;
        }
        html += '</tr></thead>';
        html += '<tbody>';
        for (let i = 0; i < size; i++) {
            html += `<tr><th>${i}</th>`;
            for (let j = 0; j < size; j++) {
                html += `<td>
                    <input type="number" 
                           name="matrix[${i}][${j}]" 
                           data-row="${i}" 
                           data-col="${j}" 
                           min="0" 
                           value="${i === j ? '0' : ''}" 
                           ${i === j ? 'readonly' : ''} />
                 </td>`;
            }
            html += '</tr>';
        }
        html += '</tbody>';
        html += '</table>';
        matrixInputsDiv.innerHTML = html;

        const inputs = matrixInputsDiv.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', (event) => {
                const row = parseInt(event.target.dataset.row);
                const col = parseInt(event.target.dataset.col);
                const value = event.target.value;

                const symmetricInput = matrixInputsDiv.querySelector(
                    `input[data-row="${col}"][data-col="${row}"]`
                );
                if (symmetricInput) {
                    symmetricInput.value = value;
                }
            });
        });
    });

    manualForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = manualForm.querySelector('button[type="submit"]');
        let originalButtonText = "";
        if (submitButton) {
            submitButton.disabled = true;
            originalButtonText = submitButton.textContent;
            submitButton.textContent = "Зачекайте...";
        }
        const formData = new FormData(manualForm);

        try {
            const response = await fetch(manualForm.action, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                renderResult(data);
            } else {
                const error = await response.text();
                console.error("Server Error Response:", error);
                resultDiv.innerHTML = `<p>${error}</p>`;
            }
        } catch (err) {
            console.error('JavaScript error:', err);
            resultDiv.innerHTML = `<p>${err.message}</p>`;
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });

    function renderResult(data) {
        if (!data || !data.originalMatrix || !data.mstEdges) {
            resultDiv.innerHTML = `<p>Помилка: отримано недійсні дані.</p>`;
            return;
        }

        const mstEdges = new Set(data.mstEdges.map(edge => `${edge.source}-${edge.destination}`));

        let html = `
        <div class="prim-results-container">
            <div class="prim-results-title">Результати алгоритму Прима</div>
            
            <div class="prim-results-table-container">
                <table class="floyd-results-table">
                    <thead>
                        <tr>
                            <th>Вершини</th>
                            ${data.originalMatrix[0].map((_, i) => `<th>${i}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.originalMatrix.map((row, i) => `
                            <tr>
                                <th>${i}</th>
                                ${row.map((weight, j) => {
            const edgeKey = `${i}-${j}`;
            const isHighlighted = mstEdges.has(edgeKey);
            const displayValue = weight && weight < 1000000 ? weight : ' ';
            return `<td style="${isHighlighted ? 'background-color: var(--red-highlight); color: white;' : ''}">${displayValue}</td>`;
        }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- MST Edges Table -->
            <div class="dijkstra-results-container" style="margin-top: 2rem;">
                <h3 class="dijkstra-results-title">Ребра мінімального кісткового дерева</h3>
                <table class="dijkstra-results-table">
                    <thead>
                        <tr>
                            <th>Початкова вершина</th>
                            <th>Кінцева вершина</th>
                            <th>Вага</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.mstEdges.map(edge => `
                            <tr>
                                <td>${edge.source}</td>
                                <td>${edge.destination}</td>
                                <td>${edge.weight}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        resultDiv.innerHTML = html;
    }
});