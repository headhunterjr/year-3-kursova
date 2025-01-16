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
            const result = await response.json();
            const gridHtml = result.map((distance, index) =>
                `<div class="result-item">Вершина ${index}: ${distance}</div>`
            ).join('');
            resultDiv.innerHTML = `<div class="result-grid">${gridHtml}</div>`;
        } else {
            const error = await response.text();
            resultDiv.innerHTML = `<p>Error: ${error}</p>`;
        }
    });
});