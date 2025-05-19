$(function() {

  // 1) Determine base-path to your API
  const p = window.location.pathname;
  let API_BASE;
  if (p.includes('/frontend/sites/')) {
    API_BASE = '../../backend/logic';
  } else {
    API_BASE = 'backend/logic';
  }

  // 2) Registration form submit 
  if ($('#registerForm').length) {
    $('#registerForm').on('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      $.ajax({
        url: `${API_BASE}/register.php`,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success(response) {
          $('#response').text(response).css('color', 'green');
        },
        error(xhr, status, error) {
          $('#response').text('Error: ' + error).css('color', 'red');
        }
      });
    });
  }

  // 3) As soon as DOM is ready, check login status
  checkLoginStatus();

  // 4) Login form submit
  $('#loginForm').on('submit', function(e) {
    e.preventDefault();
    const data = {
      action:           'login',
      loginCredentials: $('#loginCredentials').val(),
      password:         $('#password').val(),
      remember:         $('#remember').is(':checked')
    };
    if (!data.loginCredentials || !data.password) {
      $('#response').text('Please enter username and password.').css('color', 'red');
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
        $('#response').text(res.error).css('color', 'red');
      }
    });
  });

  // 5) Logout button click
  $(document).on('click', '#logoutBtn', function() {
    ajaxAuth({ action: 'logout' }, () => {
      localStorage.removeItem('user');
      window.location.href = '../../index.html';
    });
  });

  // 6) Check login status and render UI accordingly
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
        const loginHref = p.includes('/frontend/sites/')
          ? 'login.html'
          : 'frontend/sites/login.html';
        $('#user-info').html(`
          <p>You are <strong>not logged in</strong>.</p>
          <a href="${loginHref}">Login</a>
        `);
      }
    });
  }

  // 7) Fetch full cart and update cart count badge
  function updateCartCount() {
    ajaxAuth({ action: 'get_cart' }, res => {
      if (res.success && Array.isArray(res.cart)) {
        const total = res.cart.reduce((sum, i) => sum + i.quantity, 0);
        $('#cart-count').text(total);
      }
    });
  }

  // 8) Generic AJAX helper for auth & cart calls
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
        $('#response').text('Server error').css('color', 'red');
      }
    });
  }

  // 9) Show admin panel in the DOM
  function showAdminPanel() {
    $('body').append(`
      <section id="admin-panel" style="margin:20px; padding:15px; border:2px dashed #c71585;">
        <h2>Admin Area</h2>
        <p>Welcome to the administration panel.</p>
        <button onclick="location.href='admin_dashboard.html'">Go to Admin Dashboard</button>
      </section>
    `);
  }

});
