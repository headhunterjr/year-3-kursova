class FloydApp extends BaseGraphApp {
    renderResult(matrix) {
        const infinity = 10e8;
        this.elements.resultDiv.innerHTML = `
            <div class="floyd-results-container">
                <h3 class="floyd-results-title">Матриця найкоротших шляхів</h3>
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
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FloydApp();
});