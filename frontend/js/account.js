document.addEventListener("DOMContentLoaded", () => {
    const handler = "../../backend/logic/Handler/accountHandler.php";

    fetch(handler + '?action=getUserData')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const f = document.forms['updateForm'];
                f.firstname.value = data.user.firstname;
                f.lastname.value = data.user.lastname;
                f.address.value = data.user.address;
                f.email.value = data.user.email;
            }
        });

    fetch(handler + '?action=getOrders')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("orders");
            if (data.success && data.orders.length > 0) {
                data.orders.forEach(order => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <p><strong>Bestellung #${order.id}</strong><br>
                        Datum: ${new Date(order.created_at).toLocaleDateString()}</p>
                        <button onclick="openInvoice(${order.id})">Rechnung ansehen</button><hr>`;
                    container.appendChild(div);
                });
            } else {
                container.textContent = "Keine Bestellungen gefunden.";
            }
        });

    document.getElementById('updateForm').addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        fetch(handler + '?action=updateUser', {
            method: 'POST',
            body: formData
        }).then(res => res.json())
          .then(data => {
            document.getElementById("updateMessage").textContent = data.success
                ? "✅ Daten erfolgreich aktualisiert"
                : "❌ Fehler: " + data.error;
        });
    });
});

function openInvoice(orderId) {
    window.open(`rechnung.html?orderId=${orderId}`, '_blank');
}
