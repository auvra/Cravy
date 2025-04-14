
document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    fetch("../../backend/logic/register.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById("response").innerText = data;
    })
    .catch(error => {
        document.getElementById("response").innerText = "Fehler: " + error;
    });
});
