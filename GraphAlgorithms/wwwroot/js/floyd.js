﻿class FloydApp extends BaseGraphApp {
    renderResult(matrix) {
        const infinity = 1e8;
        this.elements.resultDiv.innerHTML = `
            <div class="results-container-base">
                <h3 class="floyd-results-title">Матриця найкоротших шляхів</h3>
                <div class="floyd-results-table-container">
                    <table class="floyd-results-table">
                        <thead>
                            <tr>
                                <th>Вершини</th>
                                ${matrix[0].map((_, index) => `<th>${index}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${matrix.map((row, rowIndex) => `
                                <tr>
                                    <th>${rowIndex}</th>
                                    ${row.map(cell => `
                                        <td>${cell >= infinity ? ' ' : cell}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FloydApp();
});