class BaseGraphApp {
    constructor() {
        this.elements = {
            inputMethod: document.getElementById('inputMethod'),
            excelForm: document.getElementById('excelForm'),
            manualMatrixForm: document.getElementById('manualMatrixForm'),
            matrixSizeInput: document.getElementById('matrixSize'),
            generateMatrixBtn: document.getElementById('generateMatrix'),
            manualForm: document.getElementById('manualForm'),
            matrixInputsDiv: document.getElementById('matrixInputs'),
            resultDiv: document.getElementById('result'),
            fileInput: document.querySelector('input[type="file"]'),
            fileName: document.querySelector('.file-name')
        };

        this.initializeCommonListeners();
    }

    initializeCommonListeners() {
        this.elements.inputMethod.addEventListener('change', () => {
            this.elements.resultDiv.innerHTML = '';
            const method = this.elements.inputMethod.value;
            this.elements.excelForm.style.display = method === 'excel' ? 'block' : 'none';
            this.elements.manualMatrixForm.style.display = method === 'manual' ? 'block' : 'none';
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            this.elements.fileName.textContent = e.target.files[0]?.name || 'Файл не обрано';
        });

        this.elements.generateMatrixBtn.addEventListener('click', this.handleGenerateMatrix.bind(this));

        this.elements.excelForm.addEventListener('submit', this.handleFormSubmit.bind(this, this.elements.excelForm));
        this.elements.manualForm.addEventListener('submit', this.handleFormSubmit.bind(this, this.elements.manualForm));
    }

    handleGenerateMatrix(event) {
        event.preventDefault();
        const size = parseInt(this.elements.matrixSizeInput.value);
        console.log(size);
        if (isNaN(size) || size <= 1) {
            alert('Введіть дійсну розмірність матриці.');
            return;
        }
        if (size > 100) {
            alert('Розмір матриці не може перевищувати 100х100.');
            return;
        }

        const shouldSync = this.requiresSymmetricMatrix || false;
        this.elements.matrixInputsDiv.innerHTML = this.generateMatrixHTML(size, shouldSync);
        this.elements.manualForm.style.display = 'block';

        if (shouldSync) {
            this.setupMatrixSync();
        }
    }

    async handleFormSubmit(form, event) {
        event.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton?.textContent || '';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Зачекайте...";
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form)
            });

            if (response.ok) {
                const data = await response.json();
                this.renderResult(data);
            } else {
                const error = await response.text();
                this.elements.resultDiv.innerHTML = `<p>${error}</p>`;
            }
        } catch (err) {
            console.error('JavaScript error:', err);
            this.elements.resultDiv.innerHTML = `<p>${err.message}</p>`;
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    }

    generateMatrixHTML(size, shouldSync = false) {
        let html = '<table class="matrix-input-table" style="border-collapse: collapse; text-align: center;">';
        html += '<thead><tr><th>Вершини</th>';

        for (let i = 0; i < size; i++) {
            html += `<th>${i}</th>`;
        }
        html += '</tr></thead><tbody>';

        for (let i = 0; i < size; i++) {
            html += `<tr><th>${i}</th>`;
            for (let j = 0; j < size; j++) {
                html += `<td>
                    <input type="number" 
                           name="matrix[${i}][${j}]" 
                           ${shouldSync ? `data-row="${i}" data-col="${j}"` : ''}
                           min="0" 
                           value="${i === j ? '0' : ''}" 
                           ${i === j ? 'readonly' : ''} />
                 </td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        return html;
    }

    renderResult(data) {
        throw new Error('renderResult must be implemented by child class');
    }
}