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

        this.elements.excelForm.addEventListener('submit', this.handleFormSubmit.bind(this, 'excel'));
        this.elements.manualForm.addEventListener('submit', this.handleFormSubmit.bind(this, 'manual'));
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

    async handleFormSubmit(type, event) {
        event.preventDefault();
        const form = type === 'excel' ? this.elements.excelForm : this.elements.manualForm;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton?.textContent || '';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Зачекайте...";
        }

        try {
            const formData = new FormData(form);
            if (type === 'excel') {
                const file = this.elements.fileInput.files[0];
                if (!file) {
                    alert('Будь ласка, виберіть файл.');
                    return;
                }

                const workbook = await this.readExcelFile(file);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const matrixSize = this.getMatrixSize(sheet);

                if (matrixSize.rows > 100 || matrixSize.cols > 100) {
                    alert('Розмір матриці у файлі не може перевищувати 100х100.');
                    return;
                }
            }

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

    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                resolve(workbook);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    getMatrixSize(sheet) {
        const range = XLSX.utils.decode_range(sheet['!ref']);
        return { rows: range.e.r + 1, cols: range.e.c + 1 };
    }


    generateMatrixHTML(size, shouldSync = false) {
        let maxValue = 1e6;

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
                       max="${maxValue}" 
                       value="${i === j ? '0' : ''}" 
                       ${i === j ? 'readonly' : ''} 
                       class="matrix-input"/>
             </td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';

        setTimeout(() => this.enforceMatrixInputLimits(maxValue), 0);

        return html;
    }

    enforceMatrixInputLimits(maxValue) {
        document.querySelectorAll('.matrix-input').forEach(input => {
            input.addEventListener('input', () => {
                if (input.value > maxValue) {
                    alert(`Максимальне значення: ${maxValue}`);
                    input.value = '';
                }
            });
        });
    }

    renderResult(data) {
        throw new Error('renderResult must be implemented by child class');
    }
}