document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
        });

        const resultDiv = document.getElementById('result');
        if (response.ok) {
            const matrix = await response.json();
            const vertexCount = matrix.length;

            let tableHtml = `<table class="result-table" style="border-collapse: collapse; text-align: center;">`;

            tableHtml += `
                <thead>
                    <tr>
                        <th style="padding: 5px; border: 1px solid black;">Вершини</th>
                        ${[...Array(vertexCount).keys()]
                    .map(index => `<th style="padding: 5px; border: 1px solid black;">${index}</th>`)
                    .join('')}
                    </tr>
                </thead>`;

            tableHtml += `
                <tbody>
                    ${matrix.map((row, rowIndex) => `
                        <tr>
                            <th style="padding: 5px; border: 1px solid black;">${rowIndex}</th>
                            ${row.map(cell => `
                                <td style="padding: 5px; border: 1px solid black;">
                                    ${cell === Number.MAX_SAFE_INTEGER ? '∞' : cell}
                                </td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>`;

            tableHtml += `</table>`;
            resultDiv.innerHTML = tableHtml;
        } else {
            const error = await response.text();
            resultDiv.innerHTML = `<p>Error: ${error}</p>`;
        }
    });
});
