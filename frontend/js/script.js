$(document).ready(function () {

    // ========== REGISTRIERUNG ==========
    if ($('#registerForm').length) {
      $('#registerForm').on("submit", function (e) {
        e.preventDefault();
  
        const formData = new FormData(this);
  
        $.ajax({
          url: "../../backend/logic/register.php",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: function (response) {
            $('#response').text(response).css("color", "green");
          },
          error: function (xhr, status, error) {
            $('#response').text("Fehler: " + error).css("color", "red");
          }
        });
      });
    }
  
    // ========== LOGIN ==========
    if ($('#loginForm').length) {
      $('#loginForm').on("submit", function (e) {
        e.preventDefault();
  
        const loginCredentials = $('#loginCredentials').val();
        const password = $('#password').val();
        const remember = $('#remember').is(':checked');
  
        if (!loginCredentials || !password) {
          alert("Bitte Benutzername und Passwort eingeben.");
          return;
        }
  
        $.ajax({
          url: "../../backend/logic/requesthandler.php",
          type: "POST",
          dataType: "json",
          data: {
            action: "login",
            loginCredentials: loginCredentials,
            password: password,
            remember: remember
          },
          success: function (response) {
            if (response.success) {
              window.location.href = "../../index.html";
            } else {
              $('#response').text(response.message).css("color", "red");
            }
          },
          error: function (xhr, status, error) {
            $('#response').text("Fehler: " + error).css("color", "red");
          }
        });
      });
    }
  
// ========== LOGIN-STATUS PRÜFEN (für index.html) ==========
if ($('#user-info').length) {
  $.ajax({
    url: "backend/logic/requestHandler.php?action=check_login",
    method: "GET",
    dataType: "json",
    success: function (response) {
      if (response.loggedIn) {
        $('#user-info').html(`
          <p><strong>${response.username}</strong></p>
          <button id="logoutBtn">Logout</button>
        `);

        $('#logoutBtn').on("click", function () {
          logout();
        });

      } else {
        $('#user-info').html(`
          <p>Du bist derzeit <strong>nicht eingeloggt</strong>.</p>
          <a href="frontend/sites/login.html">Jetzt einloggen</a>
        `);
      }
    },
    error: function () {
      $('#user-info').html(`<p>Fehler beim Überprüfen des Login-Status.</p>`);
    }
  });
}


  
  
  // ========== LOGOUT FUNKTION ==========
  function logout() {
    $.ajax({
      url: "backend/logic/requesthandler.php",
      type: "POST",
      data: { action: "logout" },
      success: function () {
        window.location.href = "index.html";
      }
    });
  }
  
});
  
    // ========== LOGIN ==========
    if ($('#loginForm').length) {
      $('#loginForm').on("submit", function (e) {
        e.preventDefault();
  
        const loginCredentials = $('#loginCredentials').val();
        const password = $('#password').val();
        const remember = $('#remember').is(':checked');
  
        if (!loginCredentials || !password) {
          alert("Bitte Benutzername und Passwort eingeben.");
          return;
        }
  
        $.ajax({
          url: "../../backend/logic/requesthandler.php",
          type: "POST",
          dataType: "json",
          data: {
            action: "login",
            loginCredentials: loginCredentials,
            password: password,
            remember: remember
          },
          success: function (response) {
            if (response.success) {
              window.location.href = "../../index.html";
            } else {
              $('#response').text(response.message).css("color", "red");
            }
          },
          error: function (xhr, status, error) {
            $('#response').text("Fehler: " + error).css("color", "red");
          }
        });
      });
    }
  
// ========== LOGIN-STATUS PRÜFEN (für index.html) ==========
if ($('#user-info').length) {
  $.ajax({
    url: "backend/logic/requestHandler.php?action=check_login",
    method: "GET",
    dataType: "json",
    success: function (response) {
      if (response.loggedIn) {
        $('#user-info').html(`
          <p><strong>${response.username}</strong></p>
          <button id="logoutBtn">Logout</button>
        `);

        $('#logoutBtn').on("click", function () {
          logout();
        });

      } else {
        $('#user-info').html(`
          <p>Du bist derzeit <strong>nicht eingeloggt</strong>.</p>
          <a href="frontend/sites/login.html">Jetzt einloggen</a>
        `);
      }
    },
    error: function () {
      $('#user-info').html(`<p>Fehler beim Überprüfen des Login-Status.</p>`);
    }
  });
}



  // ========== LOGOUT FUNKTION ==========
  function logout() {
    $.ajax({
      url: "backend/logic/requesthandler.php",
      type: "POST",
      data: { action: "logout" },
      success: function () {
        window.location.href = "index.html";
      }
    });
  }
  