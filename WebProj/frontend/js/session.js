$(function() {

  // 1) Determine base-path to your API
  const p = window.location.pathname;
  let API_BASE;
  if (p.includes('/frontend/sites/')) {
    API_BASE = '../../backend/logic';
  } else {
    API_BASE = 'backend/logic';
  }

  // 2) As soon as DOM is ready, check login status
  checkLoginStatus();

  // 3) Login form submit
  $('#loginForm').on('submit', function(e) {
    e.preventDefault();
    const data = {
      action:           'login',
      loginCredentials: $('#loginCredentials').val(),
      password:         $('#password').val(),
      remember:         $('#remember').is(':checked')
    };
    if (!data.loginCredentials || !data.password) {
      $('#response').text('Bitte Benutzername und Passwort eingeben.').css('color','red');
      return;
    }
    ajaxAuth(data, res => {
      if (res.success) {
        localStorage.setItem('user', JSON.stringify({
          user_id:  res.user_id,
          username: res.username,
          is_admin: res.is_admin
        }));
        window.location.href = '../../index.html';
      } else {
        $('#response').text(res.error).css('color','red');
      }
    });
  });

  // 4) Logout button
  $(document).on('click', '#logoutBtn', function() {
    ajaxAuth({ action: 'logout' }, () => {
      localStorage.removeItem('user');
      window.location.href = '../../index.html';
    });
  });

  // 5) Check login status, render user info, update cart badge, and show admin panel
  function checkLoginStatus() {
    ajaxAuth({ action: 'check_login' }, res => {
      if (res.success && res.loggedIn) {
        window.isLoggedIn = true;
        // Render user block with logout button
        $('#user-info').html(`
          <p><strong>${res.username}</strong></p>
          <button id="logoutBtn">Logout</button>
        `);
        // Update cart count on all pages
        updateCartCount();
        // Show admin area if the user is admin
        if (res.is_admin === 1) showAdminPanel();
      } else {
        window.isLoggedIn = false;
        // Compute relative link to login.html
        const loginHref = p.includes('/frontend/sites/')
          ? 'login.html'              // Already in frontend/sites/
          : 'frontend/sites/login.html';  // From project root
        $('#user-info').html(`
          <p>Du bist derzeit <strong>nicht eingeloggt</strong>.</p>
          <a href="${loginHref}">Jetzt einloggen</a>
        `);
      }
    });
  }

  // 6) Fetch full cart and update the #cart-count badge
  function updateCartCount() {
    ajaxAuth({ action: 'get_cart' }, res => {
      if (res.success && Array.isArray(res.cart)) {
        const total = res.cart.reduce((sum, i) => sum + i.quantity, 0);
        $('#cart-count').text(total);
      }
    });
  }

  // 7) Generic AJAX helper for auth & cart calls
  function ajaxAuth(payload, cb) {
    $.ajax({
      url: `${API_BASE}/requestHandler.php`,
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(payload),
      success: cb,
      error: xhr => {
        console.error('AJAX-Error', xhr);
        $('#response').text('Serverfehler').css('color','red');
      }
    });
  }

  // 8) Show admin panel in the DOM
  function showAdminPanel() {
    $('body').append(`
      <section id="admin-panel" style="margin:20px; padding:15px; border:2px dashed #c71585;">
        <h2>Admin Bereich</h2>
        <p>Willkommen im Administrationsbereich.</p>
        <button onclick="location.href='admin_dashboard.html'">Zum Admin-Dashboard</button>
      </section>
    `);
  }

});
