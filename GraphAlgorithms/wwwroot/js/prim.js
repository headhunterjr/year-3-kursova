class PrimApp extends BaseGraphApp {
    constructor() {
        super();
        this.requiresSymmetricMatrix = true;
    }

    setupMatrixSync() {
        const inputs = this.elements.matrixInputsDiv.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', (event) => {
                const row = parseInt(event.target.dataset.row);
                const col = parseInt(event.target.dataset.col);
                const value = event.target.value;

                const symmetricInput = this.elements.matrixInputsDiv
                    .querySelector(`input[data-row="${col}"][data-col="${row}"]`);
                if (symmetricInput) {
                    symmetricInput.value = value;
                }
            });
        });
    }

    renderResult(data) {
        if (!data || !data.originalMatrix || !data.mstEdges) {
            this.elements.resultDiv.innerHTML = '<p>Помилка: отримано недійсні дані.</p>';
            return;
        }

        const mstEdges = new Set(data.mstEdges.map(edge => `${edge.source}-${edge.destination}`));
        this.elements.resultDiv.innerHTML = `
            <div class="prim-results-container">
                <div class="prim-results-title">Результати алгоритму Прима</div>
                
                <div class="prim-results-table-container">
                    <table class="prim-results-table">
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
                                        return `<td class="${isHighlighted ? 'prim-highlight' : ''}">${displayValue}</td>`;
        }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="results-container-base" style="margin-top: 2rem;">
                    <h3 class="prim-results-title">Ребра мінімального каркаса</h3>
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PrimApp();
});