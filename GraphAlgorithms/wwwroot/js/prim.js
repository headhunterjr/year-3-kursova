document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
            });
            const resultDiv = document.getElementById('result');

            if (response.ok) {
                const data = await response.json();

                const mstSet = new Set(data.mstEdges.map(edge =>
                    `${edge.source}-${edge.destination}`
                ));

                let tableHtml = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
                const matrix = data.originalMatrix;

                tableHtml += "<tr><th style='border: 1px solid black; padding: 5px;'>Вершини</th>";
                for (let i = 0; i < matrix.length; i++) {
                    tableHtml += `<th style="border: 1px solid black; padding: 5px;">${i}</th>`;
                }
                tableHtml += "</tr>";

                for (let i = 0; i < matrix.length; i++) {
                    tableHtml += `<tr><th style="border: 1px solid black; padding: 5px;">${i}</th>`;
                    for (let j = 0; j < matrix[i].length; j++) {
                        const weight = matrix[i][j];
                        const isHighlighted = mstSet.has(`${i}-${j}`) || mstSet.has(`${j}-${i}`);
                        const cellStyle = isHighlighted ? "background-color: red;" : "";
                        const displayValue = (weight !== 0 && weight < 1000000) ? weight : "";
                        tableHtml += `<td style="border: 1px solid black; padding: 5px; text-align: center; ${cellStyle}">${displayValue}</td>`;
                    }
                    tableHtml += "</tr>";
                }
                tableHtml += "</table>";

                let edgesHtml = "<h3>Ребра мінімального кісткового дерева:</h3><ul>";
                data.mstEdges.forEach(edge => {
                    edgesHtml += `<li>Від ${edge.source} до ${edge.destination} (Вага: ${edge.weight})</li>`;
                });
                edgesHtml += "</ul>";

                resultDiv.innerHTML = `
                    <h3>Виділені ребра входять до мінімального кісткового дерева:</h3>
                    ${tableHtml}
                    ${edgesHtml}
                `;
            } else {
                const error = await response.text();
                resultDiv.innerHTML = `<p>Помилка: ${error}</p>`;
            }
        } catch (err) {
            console.error("Помилка JavaScript:", err);
            document.getElementById('result').innerHTML = `<p>Помилка: ${err.message}</p>`;
        }
    });
});
