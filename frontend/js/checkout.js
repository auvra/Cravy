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
  $('#applyVoucherBtn').on('click', function(e) {
    e.preventDefault();
    const code = $('#voucherCode').val().trim();
    if (!code) return;
    $.ajax({
      url: "../../backend/logic/requestHandler.php",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ action: 'validateVoucher', voucherCode: code }),
      success(res) {
        if (res.success) {
          voucher = res.voucher;
          voucherValue = parseFloat(res.voucher.value);
          $('#voucherFeedback').text('Gutschein angewendet!').css('color','green');
        } else {
          voucher = null;
          voucherValue = 0;
          $('#voucherFeedback').text(res.error).css('color','red');
        }
        renderSummary();
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
            window.location.href = 'orders.html';
          }, 1000);
        }
        else {
          $('#checkoutResponse').text(res.error).css('color','red');
        }
      }
    });
  });
});
