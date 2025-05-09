document.addEventListener("DOMContentLoaded", () => {
  // Check login state (from localStorage or session)
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData) return;

  // Wenn Admin → zeige Admin-Bereich
  if (userData.is_admin === 1) {
    showAdminPanel();
  }
});

// Admin-Bereich anzeigen
function showAdminPanel() {
  const adminHTML = `
    <section id="admin-panel" style="margin-top: 30px; padding: 15px; border: 2px dashed #c71585;">
      <h2>Admin Bereich</h2>
      <p>Willkommen im Administrationsbereich.</p>
      <button onclick="location.href='admin_dashboard.html'">Zum Admin-Dashboard</button>
    </section>
  `;
  document.body.insertAdjacentHTML("beforeend", adminHTML);
}

// 🔒 Login-Status global speichern (z. B. für Warenkorb)
window.isLoggedIn = false;

$.ajax({
  url: "http://localhost/cravy/WebProj/backend/logic/requestHandler.php?action=check_login",
  method: "GET",
  dataType: "json",
  success: function (response) {
    window.isLoggedIn = response.loggedIn === true;
    // Optional: username / id auch speichern
    if (response.loggedIn) {
      localStorage.setItem("user", JSON.stringify({
        username: response.username,
        user_id: response.user_id,
        is_admin: response.is_admin || 0
      }));
    }
  }
});
