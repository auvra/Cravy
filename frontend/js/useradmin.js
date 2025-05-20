$(document).ready(function() {
    //$('#btnCreate').click(showCreateForm);
   //$('#btnEdit').click(showEditForm);
    // $('btnCreatVoucher').click(showCreateVoucherForm);
    // $('btnListVoucher').click(showListVoucherForm);
    loadUsers();
});
// ==== USER ADMIN ====
  
  // Kunden laden
  function loadUsers() {
    $.ajax({
      url: '/cravy/WebProj/backend/logic/requestHandler.php',
      type: "POST",
      data: { action: "listUsers" },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          renderUsers(response.users);
        } else {
          $("#userContainer").html('<p> Keine Kunden gefunden.</p>');
        }
      },
      error: function () {
        $("#userContainer").html('<p> Fehler beim Laden der Kunden.</p>');
      }
    });
  }
  
  // Kundenliste anzeigen
  function renderUsers(users) {
    const $container = $("#userContainer");
    $container.empty();
  
    users.forEach(c => {
      const activeBadge = c.is_active == 1
  ? '<span class="badge bg-success">Aktiv</span>'
  : '<span class="badge bg-danger">Deaktiviert</span>';

const $card = $(`
  <div class="card mb-3">
    <div class="card-body">
      <h5>${c.firstname} ${c.lastname} (${c.username}) ${activeBadge}</h5>
      <p><strong>Email:</strong> ${c.email}</p>
      <p><strong>Ort:</strong> ${c.city}</p>

      <button class="btn btn-primary btn-sm me-2" onclick="viewOrders(${c.id})">
        Bestellungen ansehen
      </button>

      <button class="btn btn-warning btn-sm" onclick="toggleActivation(${c.id}, ${c.is_active})">
        ${c.is_active == 1 ? 'Deaktivieren' : 'Aktivieren'}
      </button>
    </div>
  </div>
`);

  
      $container.append($card);
    });
  }
  

  
  
  // Kunden aktivieren/deaktivieren
 function toggleActivation(userId, currentStatus) {
  const actionText = currentStatus == 1 ? "deaktivieren" : "aktivieren";
  if (confirm(`Willst du den Kunden wirklich ${actionText}?`)) {
    $.ajax({
      url: '/cravy/WebProj/backend/logic/requestHandler.php',
      type: "POST",
      data: {
        action: "toggleUserStatus",
        id: userId
      },
      dataType: "json",
      success: function (response) {
        alert(response.message);
        loadUsers(); // Liste neu laden
      },
      error: function () {
        alert("Fehler beim Ändern des Status.");
      }
    });
  }
}


  
  // Bestellungen eines Kunden anzeigen
  function viewOrders(userId) {

    window.currentUserId = userId;
    
    $.ajax({
      url: '/cravy/WebProj/backend/logic/requestHandler.php',
      type: "POST",
      data: { action: "getOrders", userId: userId },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          showOrders(response.orders);
        } else {
          alert("Keine Bestellungen gefunden.");
        }
      },
      error: function () {
        alert("Fehler beim Laden der Bestellungen.");
      }
    });
  }
  
function showOrders(orders) {
  let html = '<h4>Bestellungen</h4>';

  if (!orders || orders.length === 0) {
    html += '<p>Keine Bestellungen vorhanden.</p>';
  } else {
    orders.forEach(order => {
      html += `
        <div class="card mb-4">
          <div class="card-header bg-light">
            <strong>Bestellnr.:</strong> ${order.id} |
            <strong>Datum:</strong> ${order.order_date} |
            <strong>Status:</strong> ${order.status}
          </div>
          <div class="card-body">
      `;

      if (order.items && order.items.length > 0) {
        html += '<div class="row g-3">';

        order.items.forEach(item => {
          const gesamt = item.quantity * item.price;
          const produktname = `${item.marke} ${item.modell}`;
          const bildUrl = `/Zeitwert/Backend/productpictures/${item.bild_url || 'fallback.jpg'}`;

          html += `
            <div class="col-md-6">
              <div class="border rounded p-3 d-flex">
                <img src="${bildUrl}" alt="${produktname}" style="width: 100px; height: auto; margin-right: 15px;">
                <div>
                  <h5>${produktname}</h5>
                  <div class="mb-2">
                    <label>Menge:</label>
                    <input type="number" min="1" value="${item.quantity}" 
                        id="qty-${item.id}" style="width: 60px;" />
                    <button class="btn btn-sm btn-outline-success" onclick="confirmQuantity(${item.id})">✔️</button>

                  </div>
                  <p><strong>Gesamt: €${gesamt.toFixed(2)}</strong></p>
                  <button class="btn btn-sm btn-danger" onclick="deleteOrderItem(${item.id})">🗑️ Löschen</button>
                </div>
              </div>
            </div>
          `;
        });

        html += '</div>';

        html += `
          <div class="mt-3 text-end">
            <strong>🧾 Gesamtbetrag: €${parseFloat(order.total_price)}</strong>
          </div>
        `;
      } else {
        html += '<p class="text-muted">Keine Produkte in dieser Bestellung.</p>';
      }

      html += '</div></div>'; 
    });
  }

  $("#orderContainer").html(html);
}

function deleteOrderItem(orderItemId) {
  if (!confirm("Möchtest du dieses Produkt wirklich dauerhaft löschen?")) return;

  $.ajax({
    url: '/cravy/WebProj/backend/logic/requestHandler.php',
    type: "POST",
    data: {
      action: "deleteOrderItem",
      orderItemId: orderItemId
    },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        alert("Produkt wurde gelöscht.");
        viewOrders(currentUserId); // Bestellungen neu laden
      } else {
        alert("Fehler: " + (response.message || "Aktion fehlgeschlagen."));
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX Fehler:", error);
      alert("Beim Löschen ist ein Fehler aufgetreten.");
    }
  });
}

function updateOrderItemQuantity(orderItemId, quantity) {
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity < 1) {
    alert("Ungültige Menge.");
    return;
  }

  $.ajax({
    url: '/cravy/WebProj/backend/logic/requestHandler.php',
    type: "POST",
    data: {
      action: "updateOrderItemQuantity",
      orderItemId: orderItemId,
      quantity: quantity
    },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        alert("Menge wurde aktualisiert");
        viewOrders(currentUserId); 
      } else {
        alert("Fehler: " + (response.message || "Aktualisierung fehlgeschlagen"));
      }
    },
    error: function () {
      alert("Fehler beim Aktualisieren der Menge.");
    }
  });
}

function confirmQuantity(orderItemId) {
  const input = document.getElementById(`qty-${orderItemId}`);
  if (!input) return;

  const quantity = parseInt(input.value);
  if (isNaN(quantity) || quantity < 1) {
    alert("Bitte gib eine gültige Menge ein.");
    return;
  }

  updateOrderItemQuantity(orderItemId, quantity);
}

