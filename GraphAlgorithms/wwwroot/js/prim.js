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
    <h3 class="prim-results-title">Мінімальне кісткове дерево</h3>
    <div class="prim-results-table-container">
        <table class="prim-results-table">
            <thead>
                <tr>
                    <th>Вершини</th>
                    ${data.originalMatrix[0].map((_, index) => `<th>${index}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
`;

        for (let i = 0; i < data.originalMatrix.length; i++) {
            html += `<tr><th>${i}</th>`;
            for (let j = 0; j < data.originalMatrix[i].length; j++) {
                const weight = data.originalMatrix[i][j];
                const edgeKey = `${i}-${j}`;
                const isHighlighted = mstEdges.has(edgeKey);
                const displayValue = weight && weight < 1000000 ? weight : "";
                html += `<td class="${isHighlighted ? "highlight" : ""}">${displayValue}</td>`;
            }
            html += `</tr>`;
        }

        html += `
            </tbody>
        </table>
    </div>
    
    <h3 class="prim-results-title">Ребра MST</h3>
    <div class="dijkstra-results-table-container">
        <table class="dijkstra-results-table">
            <thead>
                <tr>
                    <th>Початкова вершина</th>
                    <th>Кінцева вершина</th>
                    <th>Вага</th>
                </tr>
            </thead>
            <tbody>
`;

        data.mstEdges.forEach(edge => {
            html += `
            <tr>
                <td>${edge.source}</td>
                <td>${edge.destination}</td>
                <td>${edge.weight}</td>
            </tr>`;
        });

        html += `
            </tbody>
        </table>
    </div>
</div>`;

        resultDiv.innerHTML = html;
    }

});
