$(function() {
  let cartItems = [];
  let voucher = null;
  let voucherValue = 0;

  // 1) Load current cart
  $.ajax({
    url: "../../backend/logic/requestHandler.php",
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ action: "get_cart" }),
    success(res) {
      if (res.success) {
        cartItems = res.cart;
        renderSummary();
      }
    }
  });

  // 2) Render order summary
  function renderSummary() {
    if (!cartItems.length) {
      $('#order-summary').html('<p>Ihr Warenkorb ist leer.</p>');
      return;
    }
    let html = '<table><tr><th>Produkt</th><th>Menge</th><th>Preis</th></tr>';
    let total = 0;
    cartItems.forEach(i => {
      html += `<tr>
        <td>${i.name}</td>
        <td>${i.quantity}</td>
        <td>${(i.price * i.quantity).toFixed(2)} €</td>
      </tr>`;
      total += i.price * i.quantity;
    });
    html += '</table>';
    html += `<p>Zwischensumme: ${total.toFixed(2)} €</p>`;
    if (voucher) {
      html += `<p>Gutschein (${voucher.code}): –${voucherValue.toFixed(2)} €</p>`;
      total -= voucherValue;
      html += `<p><strong>Endbetrag: ${total.toFixed(2)} €</strong></p>`;
    }
    $('#order-summary').html(html);
  }

  // 3) Apply voucher
  $('#applyVoucherBtn').on('click', function () {
  const code = $('#voucherInput').val().trim();
  const total = parseFloat($('#cartTotal').text());

  if (!code || isNaN(total) || total <= 0) {
    alert('Bitte gültigen Code und Betrag eingeben.');
    return;
  }

  $.ajax({
    url: '/cravy/WebProj/backend/logic/requestHandler.php',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      action: 'validateVoucher',
      code: code,
      total: total
    }),
    success: function (res) {
      console.log('Antwort:', res);
      if (res.success) {
        $('#discountAmount').text(res.discount.toFixed(2));
        $('#finalTotal').text(res.new_total.toFixed(2));
        alert(res.message);
      } else {
        alert(res.error);
      }
    },
    error: function () {
      alert('Fehler beim Serverkontakt.');
    }
  });
});



  // 4) Submit order
  $('#checkoutForm').on('submit', function(e) {
    e.preventDefault();
    const payment = $('input[name=payment]:checked').val();
    if (!payment && !voucher) {
      $('#checkoutResponse').text('Bitte Zahlungsmethode wählen oder gültigen Gutschein eingeben.').css('color','red');
      return;
    }
    $.ajax({
      url: "../../backend/logic/requestHandler.php",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        action:        'createOrder',
        paymentMethod: payment || null,
        voucherCode:   voucher ? voucher.code : null
      }),
      success(res) {
        if (res.success) {
          $('#checkoutResponse').text('Bestellung erfolgreich! Bestellnummer: ' + res.orderId).css('color','green');
          // Optionally clear localStorage cart and redirect
        } else {
          $('#checkoutResponse').text(res.error).css('color','red');
        }
        if (res.success) {
          // show a quick message, then redirect to the Orders page
          $('#checkoutResponse').text(
            'Bestellung erfolgreich! Leite weiter…'
          ).css('color','green');
          setTimeout(() => {
            window.location.href = 'account.html';
          }, 1000);
        }
        else {
          $('#checkoutResponse').text(res.error).css('color','red');
        }
      }
    });
  });
});
