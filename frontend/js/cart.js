$(document).ready(function () {
  // Sobald die Seite ready ist, den Warenkorb laden
  fetchCart();

  // Änderung der Menge
  $(document).on('change', '.qty-input', function () {
    const productId = $(this).data('id');
    const newQty    = parseInt($(this).val(), 10);
    updateCart(productId, newQty);
  });

  // Entfernen-Button
  $(document).on('click', '.remove-btn', function () {
    const productId = $(this).data('id');
    updateCart(productId, 0);
  });

   //  Checkout-Button click → go to checkout page
  $(document).on('click', '#checkoutBtn', function() {
    window.location.href = 'checkout.html';
  });
});

// 1) Warenkorb vom Server holen
function fetchCart() {
  $.ajax({
    url: "../../backend/logic/requestHandler.php",
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ action: "get_cart" }),
    success: function (res) {
      if (res.success && Array.isArray(res.cart) && res.cart.length > 0) {
        renderCart(res.cart);
      } else {
        $('#cart-table tbody').html(
          '<tr><td colspan="5">Dein Warenkorb ist leer.</td></tr>'
        );
        $('#cart-total').text("0.00 €");
      }
    },
    error: function () {
      alert("Fehler beim Laden des Warenkorbs.");
    }
  });
}

// 2) Menge ändern oder entfernen
function updateCart(productId, quantity) {
  // Entscheide Action-Namen je nach Menge
  const actionName = quantity > 0 ? "update_cart" : "remove_from_cart";
  const payload = { action: actionName, productId: productId };
  if (actionName === "update_cart") {
    payload.quantity = quantity;
  }

  $.ajax({
    url: "../../backend/logic/requestHandler.php",
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(payload),
    success: function (res) {
      if (res.success) {
        // Nach jeder Änderung den Warenkorb neu laden
        fetchCart();
      } else {
        alert(res.error || "Fehler beim Aktualisieren des Warenkorbs.");
      }
    },
    error: function () {
      alert("Fehler beim Senden der Anfrage.");
    }
  });
}

// 3) Warenkorb-HTML rendern
function renderCart(items) {
  let total = 0;
  const $tbody = $('#cart-table tbody').empty();

  items.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    $tbody.append(`
      <tr>
        <td>${item.name}</td>
        <td>
          <input
            type="number"
            min="1"
            class="qty-input"
            data-id="${item.product_id}"
            value="${item.quantity}"
          />
        </td>
        <td>${item.price.toFixed(2)} €</td>
        <td>${subtotal.toFixed(2)} €</td>
        <td>
          <button class="remove-btn" data-id="${item.product_id}">
            Entfernen
          </button>
        </td>
      </tr>
    `);
  });

  $('#cart-total').text(`${total.toFixed(2)} €`);
  
  // ➤ Enable checkout if there’s at least one item
  $('#checkoutBtn').prop('disabled', items.length === 0);
}
