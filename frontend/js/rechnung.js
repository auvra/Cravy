const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

if (!orderId) {
    alert("❌ Fehlende Bestell-ID!");
} else {
    fetch('../../backend/logic/Handler/invoiceHandler.php?order_id=' + orderId)
        .then(res => {
            if (!res.ok) {
                throw new Error("❌ Fehler beim Abrufen der Rechnung.");
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                alert(data.error || "❌ Fehler beim Laden der Rechnung.");
                return;
            }

            const order = data.order;
            const items = data.items;

            document.getElementById("invoiceNumber").textContent = order.id;
            document.getElementById("orderDate").textContent = new Date(order.created_at).toLocaleDateString();
            document.getElementById("address").textContent = `${order.firstname ?? ''} ${order.lastname ?? ''}, ${order.address ?? ''}`;

            const itemsEl = document.getElementById("invoiceItems");
            itemsEl.innerHTML = "";
            let total = 0;

            items.forEach(item => {
                const price = parseFloat(item.price);
                const quantity = parseInt(item.quantity);
                const sum = price * quantity;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item.product_name}</td>
                    <td>${price.toFixed(2)} €</td>
                    <td>${quantity}</td>
                    <td>${sum.toFixed(2)} €</td>
                `;
                total += sum;
                itemsEl.appendChild(row);
            });

            document.getElementById("totalAmount").textContent = total.toFixed(2);
        })
        .catch(err => {
            alert("❌ Fehler beim Laden der Rechnung: " + err.message);
        });
}
