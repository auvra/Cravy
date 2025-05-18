$(document).ready(function () {
    fetchCart();

    $(document).on('change', '.qty-input', function () {
      const id = $(this).data('id');
      const newQty = parseInt($(this).val());
      if (newQty > 0) {
        updateCart(id, newQty);
      }
    });

    $(document).on('click', '.remove-btn', function () {
      const id = $(this).data('id');
      updateCart(id, 0);
    });
  });

  function fetchCart() {
    $.ajax({
      url: "../../backend/logic/add_to_cart.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ action: "get" }),
      success: function (res) {
        if (res.success && res.items.length > 0) {
          renderCart(res.items);
        } else {
          $('#cart-table tbody').html('<tr><td colspan="5">Dein Warenkorb ist leer.</td></tr>');
          $('#cart-total').text("0.00 €");
        }
      },
      error: function () {
        alert("Fehler beim Laden des Warenkorbs.");
      }
    });
  }

  function updateCart(productId, quantity) {
    $.ajax({
      url: "../../backend/logic/add_to_cart.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        action: quantity > 0 ? "update" : "update",
        productId: productId,
        quantity: quantity
      }),
      success: function (res) {
        if (res.success) {
          fetchCart();
        } else {
          alert(res.message);
        }
      },
      error: function () {
        alert("Fehler beim Aktualisieren des Warenkorbs.");
      }
    });
  }

  function renderCart(items) {
    let total = 0;
    const tbody = $('#cart-table tbody');
    tbody.empty();

    items.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      const row = `
        <tr>
          <td>${item.name}</td>
          <td><input type="number" min="1" class="qty-input" data-id="${item.product_id}" value="${item.quantity}" /></td>
          <td>${item.price.toFixed(2)} €</td>
          <td>${subtotal.toFixed(2)} €</td>
          <td><button class="remove-btn" data-id="${item.product_id}">Entfernen</button></td>
        </tr>`;
      tbody.append(row);
    });

    $('#cart-total').text(`${total.toFixed(2)} €`);
  }