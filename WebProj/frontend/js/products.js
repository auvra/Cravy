$(document).ready(function () {
  let isLoggedIn = false;
  let currentUserId = null;

  // Login-Status prüfen, danach Produkte laden
  $.ajax({
    url: "../../backend/logic/requestHandler.php?action=check_login",
    method: "GET",
    dataType: "json",
    success: function (response) {
      if (response.loggedIn) {
        isLoggedIn = true;
        currentUserId = response.user_id;
        updateCartCountFromServer();
      } else {
        updateCartCountLocal();
      }

      // Produkte & Kategorien erst nach Login-Check laden
      loadProducts();
    },
    error: function () {
      updateCartCountLocal();
      loadProducts(); // trotzdem Produkte laden, falls Login-Check fehlschlägt
    }
  });

  function loadProducts() {
    if ($('#product-grid').length) {
      $.ajax({
        url: "http://localhost/cravy/WebProj/backend/logic/Handler/productHandler.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
          const products = data.products;
          const categories = data.categories;

          if (products.length === 0) {
            $('#product-grid').html('<p>Keine Produkte gefunden.</p>');
            return;
          }

          renderProducts(products);

           // Filterfunktion

          if ($('#category-filter').length) {
            $('#category-filter').append('<option value="">Alle Kategorien</option>');
            categories.forEach(function (cat) {
              $('#category-filter').append(`<option value="${cat}">${cat}</option>`);
            });

            $('#category-filter').on('change', function () {
              const selected = $(this).val();
              const filtered = selected
                ? products.filter(p => p.category === selected)
                : products;
              $('#product-grid').empty();
              renderProducts(filtered);
            });
          }
        },
        error: function () {
          $('#product-grid').html('<p>Fehler beim Laden der Produkte.</p>');
        }
      });
    }
  }

  function renderProducts(products) {
    $('#product-grid').empty(); // 🧹 vor jedem Rendern leeren
    products.forEach(function (product) {
      const buttonHTML = isLoggedIn
        ? `<button class="add-to-cart-btn" data-id="${product.id}">In den Warenkorb</button>`
        : `<p><em>Nur für eingeloggte Nutzer verfügbar</em></p>`;

      const productHTML = `
        <div class="product-card">
          <img src="/cravy/WebProj/backend/productpictures/${product.image_path}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p><strong>${product.price.toFixed(2)} &euro;</strong></p>
          <p>⭐ ${product.rating.toFixed(1)} / 5</p>
          ${buttonHTML}
        </div>
      `;
      $('#product-grid').append(productHTML);
    });
  }

  // 🛒 Klick auf "In den Warenkorb"
  $(document).on('click', '.add-to-cart-btn', function () {
    if (!isLoggedIn) {
      alert("Bitte logge dich ein, um Produkte in den Warenkorb zu legen.");
      return;
    }

    const productId = $(this).data('id');
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }

    saveCart(cart);

    // → Server aktualisieren via AJAX
    $.ajax({
      url: "http://localhost/cravy/WebProj/backend/logic/Handler/cartHandler.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ action: "add", productId, quantity: 1 }),
      success: function (res) {
        if (res.success) {
          console.log("Server: " + res.message);
          $('#cart-count').text(res.cartCount); // ✅ vom Server zurückgegebene Anzahl
        } else {
          console.warn("Fehler vom Server: " + res.message);
        }
      },
      error: function () {
        console.error("Fehler beim Senden an den Server.");
      }
    });
  });

  // 🧮 LocalStorage – wird nur bei Gästen verwendet (Fallback)
  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function updateCartCountLocal() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-count').text(totalItems);
  }

  // 🧮 Server → aktuelle Cart-Menge laden (bei Login)
  function updateCartCountFromServer() {
    $.ajax({
      url: "http://localhost/cravy/WebProj/backend/logic/get_cart_count.php",
      method: "GET",
      dataType: "json",
      success: function (res) {
        if (res.success) {
          $('#cart-count').text(res.cartCount);
        }
      }
    });
  }
});
