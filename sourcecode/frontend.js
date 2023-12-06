document.addEventListener('DOMContentLoaded', function () {
    fetch('/', {
        method: 'POST'
    });
});
function submitForm() {
    // Get values from the form
    const textValue = document.getElementById('text').value;
    const selectedAttribute = document.getElementById('attribute').value;

    const formData = {
        attribute: selectedAttribute,
        text: textValue
    };
    fetch('/submitForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(jsonResponse => {
        console.log("USLO");
        document.getElementById('tablica').innerHTML = jsonResponse;
      })
      .catch(error => console.error('Error:', error));
}

function showText(b) {
  var x = document.getElementById(b);
  if (x.style.display === "none") {
      x.style.display = "block";
  } else {
      x.style.display = "none";
  }
}
