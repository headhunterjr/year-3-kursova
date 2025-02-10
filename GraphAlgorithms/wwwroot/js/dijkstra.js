class DijkstraApp extends BaseGraphApp {
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

    renderResult(distances) {
        if (!Array.isArray(distances)) {
            this.elements.resultDiv.innerHTML = '<p>Помилка: отримано недійсні дані.</p>';
            return;
        }
        const infinity = 1e8;

        this.elements.resultDiv.innerHTML = `
        <div class="results-container-base">
            <h3 class="dijkstra-results-title">Найкоротші шляхи від початкової вершини</h3>
            <div class="dijkstra-results-table-container">
                <table class="dijkstra-results-table">
                    <thead>
                        <tr>
                            <th>Кінцева вершина</th>
                            <th>Найкоротша відстань</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${distances.map((distance, vertex) => {
                            const displayValue = distance && distance < infinity ? distance : ' ';
                            return `
                                                <tr>
                                                    <td>${vertex}</td>
                                                    <td>${displayValue}</td>
                                                </tr>
                                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DijkstraApp();
});