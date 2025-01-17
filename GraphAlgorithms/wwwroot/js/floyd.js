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

        const formData = new FormData(excelForm);

        try {
            const response = await fetch(excelForm.action, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const matrix = await response.json();
                renderMatrix(matrix);
            } else {
                const error = await response.text();
                resultDiv.innerHTML = `<p>Error: ${error}</p>`;
            }
        } catch (err) {
            console.error('JavaScript error:', err);
            resultDiv.innerHTML = `<p>Error: ${err.message}</p>`;
        }
    });

    generateMatrixBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const size = parseInt(matrixSizeInput.value);
        if (isNaN(size) || size <= 0) {
            alert('Please enter a valid matrix size.');
            return;
        }

        matrixInputsDiv.innerHTML = '';
        manualForm.style.display = 'block';

        let html = '<table class="matrix-input-table" style="border-collapse: collapse; text-align: center;">';
        html += '<thead><tr><th>Vertices</th>';
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
    });


    manualForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const disabledInputs = manualForm.querySelectorAll('input:disabled');
        disabledInputs.forEach(input => input.disabled = false);

        const formData = new FormData(manualForm);

        try {
            const response = await fetch(manualForm.action, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const matrix = await response.json();
                renderMatrix(matrix);
            } else {
                const error = await response.text();
                console.error("Server Error Response:", error);
                resultDiv.innerHTML = `<p>Error: ${error}</p>`;
            }
        } catch (err) {
            console.error('JavaScript error:', err);
            resultDiv.innerHTML = `<p>Error: ${err.message}</p>`;
        } finally {
            disabledInputs.forEach(input => input.disabled = true);
        }
    });

    function renderMatrix(matrix) {
        const infinity = 10e8;
        let tableHtml = `<table class="result-table" style="border-collapse: collapse; text-align: center;">`;
        tableHtml += `
        <thead>
            <tr>
                <th>Vertices</th>
                ${matrix[0].map((_, index) => `<th>${index}</th>`).join('')}
            </tr>
        </thead>`;
        tableHtml += `
        <tbody>
            ${matrix.map((row, rowIndex) => `
                <tr>
                    <th>${rowIndex}</th>
                    ${row.map(cell => `
                        <td>${cell > infinity ? '' : cell}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>`;
        tableHtml += `</table>`;
        resultDiv.innerHTML = tableHtml;
    }
});
