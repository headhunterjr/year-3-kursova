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
                const distances = await response.json();
                renderDistances(distances);
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
            alert('Введіть дійсну розмірність матриці.');
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

        const disabledInputs = manualForm.querySelectorAll('input:disabled');
        disabledInputs.forEach(input => input.disabled = false);

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
                const distances = await response.json();
                renderDistances(distances);
            } else {
                const error = await response.text();
                console.error("Server Error Response:", error);
                resultDiv.innerHTML = `<p>${error}</p>`;
            }
        } catch (err) {
            console.error('JavaScript error:', err);
            resultDiv.innerHTML = `<p>${err.message}</p>`;
        } finally {
            disabledInputs.forEach(input => input.disabled = true);
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });

    function renderDistances(distances) {
        if (!Array.isArray(distances)) {
            resultDiv.innerHTML = `<p>Помилка: отримано недійсні дані.</p>`;
            return;
        }

        let html = `
        <div class="dijkstra-results-container">
            <h3 class="dijkstra-results-title">Найкоротші шляхи від початкової вершини</h3>
            <table class="dijkstra-results-table">
                <thead>
                    <tr>
                        <th>Кінцева вершина</th>
                        <th>Найкоротша відстань</th>
                    </tr>
                </thead>
                <tbody>
    `;

        distances.forEach((distance, vertex) => {
            html += `
            <tr>
                <td>${vertex}</td>
                <td>${distance}</td>
            </tr>
        `;
        });

        html += `
                </tbody>
            </table>
        </div>
    `;

        resultDiv.innerHTML = html;
    }
});
