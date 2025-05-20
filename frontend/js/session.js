$(function () {

  // Verwende absoluten Pfad zur API
  const API_BASE = '/cravy/WebProj/backend/logic';

  // 1) Registration form submit
  if ($('#registerForm').length) {
    $('#registerForm').on('submit', function (e) {
      e.preventDefault();

      const data = {
        action: 'register',
        salutation: $('#salutation').val(),
        firstname: $('#firstname').val(),
        lastname: $('#lastname').val(),
        address: $('#address').val(),
        zip: $('#zip').val(),
        city: $('#city').val(),
        email: $('#email').val(),
        username: $('#username').val(),
        password: $('#password').val(),
        confirm_password: $('#confirm_password').val(),
        payment_info: $('#payment_info').val() || ''
      };

      $.ajax({
        url: `${API_BASE}/requestHandler.php`,
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
        success(response) {
          $('#response')
            .text(response.message || response.error || JSON.stringify(response))
            .css('color', response.success ? 'green' : 'red');
        },
        error(xhr) {
          console.error('AJAX Error', xhr);
          $('#response').text('Server error').css('color', 'red');
        }
      });
    });
  }

  // 2) Login form submit
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    const data = {
      action: 'login',
      loginCredentials: $('#loginCredentials').val(),
      password: $('#password').val(),
      remember: $('#remember').is(':checked')
    };

    if (!data.loginCredentials || !data.password) {
      $('#response').text('Bitte Benutzername und Passwort eingeben.').css('color', 'red');
      return;
    }

    ajaxAuth(data, res => {
      if (res.success) {
        localStorage.setItem('user', JSON.stringify({
          user_id: res.user_id,
          username: res.username,
          is_admin: res.is_admin
        }));

        // ◉ MERGE GUEST CART HERE:
      const guestCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (guestCart.length) {
        guestCart.forEach(item => {
          // send each to server
          ajaxAuth({
           action:    'add_to_cart',
           productId: item.id,
           quantity:  item.quantity
         }, () => {/* ignore response */});
       });
      // clear LocalStorage fallback
      localStorage.removeItem('cart');
    }
         window.location.href = '/cravy/WebProj/index.html';

      } else {
        $('#response').text(res.error).css('color', 'red');
      }
    });
  });

  // 3) Logout
  $(document).on('click', '#logoutBtn', function () {
    ajaxAuth({ action: 'logout' }, () => {
      localStorage.removeItem('user');
      window.location.href = '/cravy/WebProj/index.html';
    });
  });

  // 4) Check login status and render UI
  checkLoginStatus();

  function checkLoginStatus() {
    ajaxAuth({ action: 'check_login' }, res => {
      if (res.success && res.loggedIn) {
        window.isLoggedIn = true;
        $('#user-info').html(`
          <p><strong>${res.username}</strong></p>
          <button id="logoutBtn">Logout</button>
        `);
        updateCartCount();
        if (res.is_admin === 1) showAdminPanel();
      } else {
        window.isLoggedIn = false;
        $('#user-info').html(`
          <p>Sie sind <strong>nicht eingeloggt</strong>.</p>
          <a href="/cravy/WebProj/frontend/sites/login.html">Login</a>
        `);
      }
    });
  }

  // 5) Update cart count
  function updateCartCount() {
    ajaxAuth({ action: 'get_cart' }, res => {
      if (res.success && Array.isArray(res.cart)) {
        const total = res.cart.reduce((sum, i) => sum + i.quantity, 0);
        $('#cart-count').text(total);
      }
    });
  }

  // 6) General AJAX helper
  function ajaxAuth(payload, cb) {
    $.ajax({
      url: `${API_BASE}/requestHandler.php`,
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(payload),
      success: cb,
      error: xhr => {
        console.error('AJAX Error', xhr);
        console.log('Server response:', xhr.responseText);
        $('#response').text('Serverfehler').css('color', 'red');
      }
    });
  }
  
  // expose it to the global scope so orders.js (and any other script) can call it
window.ajaxAuth = ajaxAuth;

  // 7) Show admin panel
  function showAdminPanel() {
    $('body').append(`
      <section id="admin-panel" style="margin:20px; padding:15px; border:2px dashed #c71585;">
        <h2>Admin-Bereich</h2>
        <p>Willkommen im Admin-Panel.</p>
        <button onclick="location.href='/cravy/WebProj/frontend/sites/admin_dashboard.html'">Zum Admin Dashboard</button>
      </section>
    `);
  }

});
