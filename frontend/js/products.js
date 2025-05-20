$(document).ready(function () {
  let isLoggedIn = false;
  let currentUserId;

  // 1) Check login status, then load cart count and products
  $.ajax({
    url: "../../backend/logic/requestHandler.php",
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ action: "check_login" }),
    success(response) {
      if (response.success && response.loggedIn) {
        isLoggedIn = true;
        currentUserId = response.user_id;
        updateCartCountFromServer();
      } else {
        updateCartCountLocal();
      }
      loadProducts();
      bindDragAndDrop(); // Initialize drag-and-drop handlers after page is ready
    },
    error() {
      updateCartCountLocal();
      loadProducts();
      bindDragAndDrop();
    }
  });

  // 2) Load products and categories
  function loadProducts() {
    if (!$('#product-grid').length) return;

    $.ajax({
      url: "../../backend/logic/requestHandler.php",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ action: "getProducts" }),
      success(response) {
        if (response.success) {
          const products   = response.products;
          const categories = response.categories;
          renderProducts(products);
          setupCategoryFilter(categories, products);
        } else {
          $('#product-grid').html(`<p>${response.error}</p>`);
        }
      },
      error() {
        $('#product-grid').html('<p>Error loading products.</p>');
      }
    });
  }

  // 3) Render products with draggable cards
  function renderProducts(products) {
    $('#product-grid').empty();
    products.forEach(product => {
      const btn = isLoggedIn
        ? `<button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>`
        : `<p><em>Login to add items to cart</em></p>`;

      $('#product-grid').append(`
        <div class="product-card" draggable="true" data-id="${product.id}">
          <img src="/cravy/WebProj/backend/productpictures/${product.image_path}"
               alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p><strong>${parseFloat(product.price || 0).toFixed(2)} €</strong></p>
          <p>⭐ ${product.rating?.toFixed(1) || '–'} / 5</p>
          ${btn}
        </div>
      `);
    });
  }

  // Bind drag-and-drop handlers once
  function bindDragAndDrop() {
    // Handle drag start on product cards
    $(document)
      .off('dragstart', '.product-card')
      .on('dragstart', '.product-card', function (e) {
        const dt = e.originalEvent.dataTransfer;
        dt.effectAllowed = 'copy';
        dt.setData('text/plain', $(this).data('id'));
      });

    // Configure cart indicator as drop zone
    $('#cart-indicator')
      .off('dragenter dragover dragleave drop')
      .on('dragenter dragover', function (e) {
        e.preventDefault();
        const dt = e.originalEvent.dataTransfer;
        dt.dropEffect = 'copy';
        $(this).addClass('drag-over');
      })
      .on('dragleave', function (e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
      })
      .on('drop', function (e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
        const productId = e.originalEvent.dataTransfer.getData('text/plain');
        if (!isLoggedIn) {
          alert("Please login to add items to cart.");
          return;
        }
        addToCartAjax(productId, 1);
      });
  }

  // 4) AJAX helper for adding items to cart
  function addToCartAjax(productId, qty) {
    $.ajax({
      url: "../../backend/logic/requestHandler.php",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        action:    "add_to_cart",
        productId: productId,
        quantity:  qty
      }),
      success(response) {
        if (response.success) {
          $('#cart-count').text(response.cartCount);
          // Update localStorage fallback
          const cart = getCart();
          const existing = cart.find(i => i.id === +productId);
          if (existing) existing.quantity += qty;
          else cart.push({ id: +productId, quantity: qty });
          saveCart(cart);
        } else {
          console.warn("Server error:", response.error);
        }
      },
      error() {
        console.error("Failed to send request to server.");
      }
    });
  }

  // 5) Setup category filter
  function setupCategoryFilter(categories, products) {
    if (!$('#category-filter').length) return;
    const $sel = $('#category-filter').empty()
      .append('<option value="">All Categories</option>');
    categories.forEach(cat => {
      $sel.append(`<option value="${cat}">${cat}</option>`);
    });
    $sel.on('change', () => {
      const val = $sel.val();
      const shown = val
        ? products.filter(p => p.category === val)
        : products;
      renderProducts(shown);
    });
  }

  // 6) Handle "Add to Cart" button click
  $(document).on('click', '.add-to-cart-btn', function () {
    const productId = $(this).data('id');
    if (!isLoggedIn) {
      alert("Please login to add items to cart.");
      return;
    }
    const cart = getCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: productId, quantity: 1 });
    saveCart(cart);
    addToCartAjax(productId, 1);
  });

  // 7) LocalStorage helper functions
  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  function updateCartCountLocal() {
    const total = getCart().reduce((sum, i) => sum + i.quantity, 0);
    $('#cart-count').text(total);
  }

  // 8) Load cart count from server
  function updateCartCountFromServer() {
    $.ajax({
      url: "../../backend/logic/requestHandler.php",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ action: "get_cart" }),
      success(response) {
        if (response.success) {
          const total = response.cart.reduce((sum, i) => sum + i.quantity, 0);
          $('#cart-count').text(total);
        }
      }
    });
  }
});
