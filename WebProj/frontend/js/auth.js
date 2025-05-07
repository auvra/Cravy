document.addEventListener("DOMContentLoaded", () => {
    // Check login state (this could be from localStorage or session)
    const userData = JSON.parse(localStorage.getItem("user"));
  
    if (!userData) return;
  
    // If user is admin, show special admin section
    if (userData.is_admin === 1) {
      showAdminPanel();
    }
  });
  
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
  