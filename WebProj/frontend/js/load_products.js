$(document).ready(function () {
    if ($('#product-grid').length) {
      $.ajax({
        url: "../../backend/logic/get_products.php",
        type: "GET",
        dataType: "json",
        success: function (products) {
          if (products.length === 0) {
            $('#product-grid').html('<p>Keine Produkte gefunden.</p>');
            return;
          }
  
          products.forEach(function (product) {
            const productHTML = `
              <div class="product-card">
                <img src="../../backend/${product.image_path}" alt="${product.name}" />
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p><strong>${product.price.toFixed(2)} &euro;</strong></p>
                <p>⭐ ${product.rating.toFixed(1)} / 5</p>
              </div>
            `;
  
            $('#product-grid').append(productHTML);
          });
        },
        error: function () {
          $('#product-grid').html('<p>Fehler beim Laden der Produkte.</p>');
        }
      });
    }
  });
  