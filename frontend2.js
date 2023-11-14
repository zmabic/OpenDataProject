const form = document.getElementById('form');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const attribute = document.getElementById("attribute").value;
    const text = document.getElementById("text").value;

    const data = {
        attribute: attribute,
        tekst: text
    };

    fetch('/submitForm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(jsonData => {
        // Call a function to populate the table with the JSON data
        populateTable(jsonData);
    })
    .catch(error => console.error('Error:', error));
    
    document.getElementById('link1').style.display = 'inline';
    document.getElementById('link2').style.display = 'inline';
});

function populateTable(data) {
    const tableBody = document.getElementById('tablica');
    tableBody.innerHTML = ''; // Clear existing rows

    if (data.length > 0) {
        const headerRow = tableBody.insertRow();

        // Add header cells with column names
        for (const key in data[0]) {
            if (Object.hasOwnProperty.call(data[0], key)) {
                const headerCell = headerRow.insertCell();
                headerCell.textContent = key;
            }
        }

        // Add data rows
        data.forEach(obj => {
            const newRow = tableBody.insertRow();

            // Loop through the properties of each object
            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const cell = newRow.insertCell();
                    cell.textContent = obj[key];
                }
            }
        });
    }
}


