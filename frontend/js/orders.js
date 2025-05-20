// frontend/js/orders.js
$(function() {
  // 1) Fetch and render all orders for the logged-in user
  ajaxAuth({ action: 'getOrders' }, res => {
    if (res.success) {
      renderOrdersList(res.orders);
    } else {
      $('#orders-list').html('<p>Fehler: ' + (res.error||'Unknown error') + '</p>');
    }
  });

  // 2) Build the orders list
  function renderOrdersList(orders) {
    if (!orders.length) {
      $('#orders-list').html('<p>Keine Bestellungen gefunden.</p>');
      return;
    }
    let html = '<ul class="orders-list">';
    orders.forEach(o => {
      // ensure total is treated as a number
      const total = parseFloat(o.total) || 0;
      html += `
        <li>
          <a href="#" class="order-link" data-id="${o.id}">
            Bestellung #${o.id} – ${new Date(o.created_at).toLocaleDateString()} – ${total.toFixed(2)} €
          </a>
        </li>
      `;
    });
    html += '</ul>';
    $('#orders-list').html(html);
  }

  // 3) When clicking an order, fetch its details
  $(document).on('click', '.order-link', function(e) {
    e.preventDefault();
    const orderId = $(this).data('id');
    ajaxAuth({ action: 'getOrder', orderId: orderId }, res => {
      if (res.success) {
        renderOrderDetails(res.order, res.items);
      } else {
        $('#order-details').html('<p>Fehler: ' + (res.error||'Unknown error') + '</p>');
      }
    });
  });

  // 4) Render one order’s details
  function renderOrderDetails(order, items) {
    let html = `
      <h2>Bestellung #${order.id}</h2>
      <p>Datum: ${new Date(order.created_at).toLocaleString()}</p>
      <p>Zahlungsmethode: ${order.payment_method || 'Gutschein'}</p>
      <table class="order-details-table">
        <thead>
          <tr><th>Produkt</th><th>Menge</th><th>Preis</th><th>Gesamt</th></tr>
        </thead>
        <tbody>
    `;
    let sum = 0;
    items.forEach(i => {
      const line = i.price_at_time * i.quantity;
      sum += line;
      html += `
        <tr>
          <td>${i.name}</td>
          <td>${i.quantity}</td>
          <td>${i.price_at_time.toFixed(2)} €</td>
          <td>${line.toFixed(2)} €</td>
        </tr>
      `;
    });
    html += `
        </tbody>
      </table>
      <p><strong>Endbetrag: ${order.total.toFixed(2)} €</strong></p>
    `;
    $('#order-details').html(html);
  }
});
