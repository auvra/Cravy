$(document).ready(function() {
    $('#btnCreate').click(showCreateForm);
    $('#btnEdit').click(showEditForm);
    // $('btnCreatVoucher').click(showCreateVoucherForm);
    // $('btnListVoucher').click(showListVoucherForm);
    //loadUsers();
});

// Produkte erstellen
function showCreateForm() {
  $('#contentArea').html(`
    <h3>Neues Cravy</h3>
    <form id="createForm" enctype="multipart/form-data">
      <input class="form-control mb-2" type="text" name="name" placeholder="Cravyname" required>
      <textarea class="form-control mb-2" name="description" placeholder="Beschreibung" rows="3"></textarea>
      <input class="form-control mb-2" type="number" step="0.01" name="price" placeholder="Preis (€)" required>
      <input class="form-control mb-2" type="text" name="category" placeholder="Kategorie" required>
      <input class="form-control mb-2" type="number" step="0.1" name="rating" placeholder="Bewertung">
      <input class="form-control mb-2" type="file" name="image" accept="image/*" required>
      <button class="btn btn-success" type="submit">Speichern</button>
    </form>
  `);

  $('#createForm').submit(function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    formData.append('action', 'createProduct');

    $.ajax({
      url: '/cravy/WebProj/backend/logic/requestHandler.php',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        alert(response.message || response.error || 'Produkt gespeichert.');
        $('#contentArea').empty();
      },
      error: function (xhr) {
        console.error(xhr);
        alert('Fehler beim Erstellen.');
      }
    });
  });
}


  // Produkte bearbeiten Form
  function showEditForm() {
    $.ajax({
      url: 'http://localhost/cravy/WebProj/Backend/logic/requestHandler.php',
      type: 'POST',
      data: { action: "getProducts" },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          renderAdminProducts(response.products);
        }
      }
    });
  }
  // Produkte auflisten für den Admin-Bereich
function renderAdminProducts(products) {
  const $container = $("#contentArea");
  if ($container.length === 0) return;
  $container.empty();

  let html = `
    <table class="table table-striped table-hover align-middle">
      <thead>
        <tr>
          <th>Name</th>
          <th>Kategorie</th>
          <th>Preis (€)</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
  `;

  products.forEach((product) => {
    html += `
      <tr>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>€ ${parseFloat(product.price || 0).toFixed(2)}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="editProduct(${product.id})">Bearbeiten</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Löschen</button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  $container.html(html);
}

  
  // Produkte bearbeiten
  function editProduct(id) {
  $.ajax({
    url: 'http://localhost/cravy/WebProj/backend/logic/requestHandler.php',
    type: 'POST',
    data: { action: 'getProduct', productId: id },
    dataType: 'json',
    success: function (response) {
      if (response.success) {
        const product = response.product;
        $('#contentArea').html(`
            <h3>Produkt bearbeiten</h3>
            <form id="updateForm" enctype="multipart/form-data">
                <input type="hidden" name="id" value="${product.id}">
                <input class="form-control mb-2" type="text" name="name" value="${product.name}" required>
                <textarea class="form-control mb-2" name="description" rows="3">${product.description || ''}</textarea>
                <input class="form-control mb-2" type="number" name="price" value="${product.price}" step="0.01" required>
                <input class="form-control mb-2" type="text" name="category" value="${product.category}" required>
                <input class="form-control mb-2" type="number" name="rating" value="${product.rating || ''}" step="0.1">

                <div class="mb-3">
                <label>Aktuelles Bild:</label><br>
                    ${product.image_path ? `<img src="/cravy/WebProj/backend/productpictures/${product.image_path}" style="max-width:150px;">` : '<em>Kein Bild</em>'}
                </div>

                <div class="mb-3">
                    <label>Neues Bild:</label>
                    <input class="form-control" type="file" name="image" accept="image/*">
                </div>

                <button class="btn btn-success" type="submit">Speichern</button>
            </form>
        `);

        $('#updateForm').submit(function (e) {
          e.preventDefault();
          const formData = new FormData(this);
          formData.append('action', 'updateProduct');

          $.ajax({
            url: 'http://localhost/cravy/WebProj/backend/logic/requestHandler.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function (response) {
              alert(response.message || response.error);
              showEditForm();
            }
          });
        });
      }
    }
  });
}

// Produkte löschen
function deleteProduct(id) {
  if (confirm('Produkt wirklich löschen?')) {
    $.ajax({
      url: 'http://localhost/cravy/WebProj/backend/logic/requestHandler.php',
      type: 'POST',
      data: JSON.stringify({ action: 'deleteProduct', productId: id }),
      contentType: 'application/json',
      dataType: 'json',
      success: function (response) {
        alert(response.message || response.error);
        showEditForm();
      },
      error: function () {
        alert('Fehler beim Löschen des Produkts.');
      }
    });
  }
}

  