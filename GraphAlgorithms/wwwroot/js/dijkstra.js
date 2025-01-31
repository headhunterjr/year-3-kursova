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

        this.elements.resultDiv.innerHTML = `
            <div class="results-container-base">
                <h3 class="dijkstra-results-title">Найкоротші шляхи від початкової вершини</h3>
                <table class="dijkstra-results-table">
                    <thead>
                        <tr>
                            <th>Кінцева вершина</th>
                            <th>Найкоротша відстань</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${distances.map((distance, vertex) => `
                            <tr>
                                <td>${vertex}</td>
                                <td>${distance}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DijkstraApp();
});