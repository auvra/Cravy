$(function () {
  $('#btnCreateVoucher').on('click', showVoucherForm);
  $('#btnListVoucher').on('click', loadVouchers);
});

function showVoucherForm() {
  const html = `
    <div class="col-md-6">
      <form id="createVoucherForm" class="border p-3 bg-light rounded">
        <div class="mb-3">
          <label for="voucherCode" class="form-label">Code</label>
          <input type="text" class="form-control" id="voucherCode" required>
        </div>
        <div class="mb-3">
          <label for="voucherValue" class="form-label">Wert (€)</label>
          <input type="number" class="form-control" id="voucherValue" step="0.01" required>
        </div>
        <div class="mb-3">
          <label for="voucherDate" class="form-label">Gültig bis</label>
          <input type="date" class="form-control" id="voucherDate">
        </div>
        <button type="submit" class="btn btn-success">Erstellen</button>
      </form>
    </div>
  `;

  $('#contentArea').html(html);

  $('#createVoucherForm').on('submit', function (e) {
    e.preventDefault();

    const data = {
      action: 'createVoucher',
      code: $('#voucherCode').val(),
      value: parseFloat($('#voucherValue').val()),
      valid_until: $('#voucherDate').val() || null
    };

    $.ajax({
      url: '/cravy/WebProj/backend/logic/requestHandler.php',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(data),
      success(res) {
        alert(res.message || res.error);
        if (res.success) {
          loadVouchers();
        }
      },
      error() {
        alert('Fehler beim Speichern.');
      }
    });
  });
}

function loadVouchers() {
  $.ajax({
    url: '/cravy/WebProj/backend/logic/requestHandler.php',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ action: 'listVouchers' }),
    success(res) {
      if (res.success) {
        renderVoucherList(res.vouchers);
      } else {
        $('#contentArea').html('<p>Keine Gutscheine gefunden.</p>');
      }
    },
    error() {
      $('#contentArea').html('<p>Fehler beim Laden der Gutscheine.</p>');
    }
  });
}

function renderVoucherList(vouchers) {
  let html = `
    <div class="col-md-10">
    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>Code</th>
          <th>Wert (€)</th>
          <th>Gültig bis</th>
          <th>Status</th>
          <th>Aktion</th>
        </tr>
      </thead>
      <tbody>
  `;

  vouchers.forEach(v => {
    const used = v.is_used == 1 ? 'Verwendet' : 'Aktiv';
    const valid = v.valid_until ?? '-';
    html += `
      <tr>
        <td>${v.code}</td>
        <td>${parseFloat(v.value).toFixed(2)}</td>
        <td>${valid}</td>
        <td>${used}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteVoucher(${v.id})">Löschen</button></td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  $('#contentArea').html(html);
}

function deleteVoucher(id) {
  if (!confirm("Gutschein wirklich löschen?")) return;

  $.ajax({
    url: '/cravy/WebProj/backend/logic/requestHandler.php',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ action: 'deleteVoucher', id }),
    success(res) {
      alert(res.message || res.error);
      if (res.success) loadVouchers();
    },
    error() {
      alert('Fehler beim Löschen.');
    }
  });
}

