$(document).ready(function () {
  if ($('#product-grid').length) {
    $.ajax({
      url: "http://localhost/cravy/WebProj/backend/logic/get_products.php",
      type: "GET",
      dataType: "json",
      success: function (data) {
        const products = data.products;
        const categories = data.categories;

        if (products.length === 0) {
          $('#product-grid').html('<p>Keine Produkte gefunden.</p>');
          return;
        }

        products.forEach(function (product) {
          const productHTML = `
            <div class="product-card">
              <img src="/cravy/WebProj/backend/productpictures/${product.image_path}" alt="${product.name}" />
              <h3>${product.name}</h3>
              <p>${product.description}</p>
              <p><strong>${product.price.toFixed(2)} &euro;</strong></p>
              <p>⭐ ${product.rating.toFixed(1)} / 5</p>
            </div>
          `;
          $('#product-grid').append(productHTML);
        });

        // Falls Kategorie-Dropdown vorhanden ist, füllen
        if ($('#category-filter').length) {
          $('#category-filter').append('<option value="">Alle Kategorien</option>');
          categories.forEach(function (cat) {
            $('#category-filter').append(`<option value="${cat}">${cat}</option>`);
          });

          // Filterfunktion
          $('#category-filter').on('change', function () {
            const selected = $(this).val();
            $('#product-grid').empty();

            const filtered = selected
              ? products.filter(p => p.category === selected)
              : products;

            filtered.forEach(function (product) {
              const productHTML = `
                <div class="product-card">
                  <img src="/cravy/WebProj/backend/productpictures/${product.image_path}" alt="${product.name}" />
                  <h3>${product.name}</h3>
                  <p>${product.description}</p>
                  <p><strong>${product.price.toFixed(2)} &euro;</strong></p>
                  <p>⭐ ${product.rating.toFixed(1)} / 5</p>
                </div>
              `;
              $('#product-grid').append(productHTML);
            });
          });
        }
      },
      error: function () {
        $('#product-grid').html('<p>Fehler beim Laden der Produkte.</p>');
      }
    });
  }
});
