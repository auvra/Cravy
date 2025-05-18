document.addEventListener("DOMContentLoaded", () => {
  // initiales User-Objekt aus LocalStorage laden (falls vorhanden)
  const stored = localStorage.getItem("user");
  if (stored) {
    const userData = JSON.parse(stored);
    if (userData.is_admin === 1) {
      showAdminPanel();
    }
  }

  // Login-Status vom Server abfragen
  $.ajax({
    url: "../../backend/logic/requestHandler.php",
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ action: "check_login" }),
    success: function (response) {
      if (response.success && response.loggedIn) {
        window.isLoggedIn = true;
        const user = {
          username: response.username,
          user_id:  response.user_id,
          is_admin: response.is_admin || 0
        };
        localStorage.setItem("user", JSON.stringify(user));
        if (user.is_admin === 1) showAdminPanel();
      } else {
        window.isLoggedIn = false;
        localStorage.removeItem("user");
      }
    }
  });
});

// Admin-Bereich anzeigen
function showAdminPanel() {
  const adminHTML = `
    <section id="admin-panel" style="margin-top:30px; padding:15px; border:2px dashed #c71585;">
      <h2>Admin Bereich</h2>
      <p>Willkommen im Administrationsbereich.</p>
      <button onclick="location.href='admin_dashboard.html'">Zum Admin-Dashboard</button>
    </section>`;
  document.body.insertAdjacentHTML("beforeend", adminHTML);
}
