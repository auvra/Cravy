<?php
require_once __DIR__ . '/../config/dbaccess.php';

class Order {

    // Bestellung erstellen
    public function createOrder($userId, $paymentMethod): ?int {
    $db = dbaccess::getInstance();

    // 🛒 Schritt 1: Cart holen
    $cartItems = $db->select("SELECT * FROM cart WHERE user_id = :uid", [':uid' => $userId]);
    if (!$cartItems || count($cartItems) === 0) {
        return null;
    }

    // 🧾 Schritt 2: Neue Bestellung
    $insertOrder = $db->execute(
        "INSERT INTO orders (user_id, payment_method) VALUES (:uid, :pm)",
        [':uid' => $userId, ':pm' => $paymentMethod]
    );

    if (!$insertOrder) return null;
    $orderId = $db->getLastInsertId();

    // ✅ Schritt 3: Artikel in order_items schreiben
    $allOk = true;
    foreach ($cartItems as $item) {
        $ok = $db->execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price)
             VALUES (:oid, :pid, :qty, :price)",
            [
                ':oid' => $orderId,
                ':pid' => $item['product_id'],
                ':qty' => $item['quantity'],
                ':price' => $item['price_at_time'] ?? 0  // fallback falls leer
            ]
        );

        if (!$ok) {
            $allOk = false;
            break;
        }
    }

    // ❌ Fehler beim Insert: Abbrechen und cart NICHT löschen
    if (!$allOk) {
        return null;
    }

    // 🧹 Schritt 4: Cart löschen NUR wenn alles erfolgreich
    $db->execute("DELETE FROM cart WHERE user_id = :uid", [':uid' => $userId]);

    return $orderId;
}


    // Alle Bestellungen eines Nutzers auflisten (nach Datum aufsteigend)
    public function getOrdersByUser(int $userId): array {
        $db = dbaccess::getInstance();
        $sql = "SELECT * FROM orders WHERE user_id = :uid ORDER BY order_date ASC";
        return $db->select($sql, [':uid' => $userId]);
    }

    // Details zu einer Bestellung abrufen (mit Produktdaten)
    public function getOrderDetails(int $orderId): array {
        $db = dbaccess::getInstance();
        $sql = "SELECT oi.*, p.name AS product_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = :oid";
        return $db->select($sql, [':oid' => $orderId]);
    }

    // Rechnung generieren (Info über Bestellung, Positionen, Benutzeradresse etc.)
    public function generateInvoice(int $orderId): ?array {
        $db = dbaccess::getInstance();

        // Bestellung
        $order = $db->getSingle("SELECT * FROM orders WHERE id = :id", [':id' => $orderId]);
        if (!$order) return null;

        // Benutzer
        $user = $db->getSingle("SELECT * FROM users WHERE id = :uid", [':uid' => $order['user_id']]);
        if (!$user) return null;

        // Positionen
        $items = $this->getOrderDetails($orderId);

        return [
            'order' => $order,
            'user'  => $user,
            'items' => $items
        ];
    }
     public function getInvoiceData(int $orderId): ?array {
    $db = dbaccess::getInstance();

    $order = $db->getSingle("SELECT o.*, u.firstname, u.lastname, u.address
                             FROM orders o
                             JOIN users u ON o.user_id = u.id
                             WHERE o.id = :id", [':id' => $orderId]);

    if (!$order) return null;

    $items = $db->select("SELECT oi.*, p.name AS product_name
                          FROM order_items oi
                          JOIN products p ON oi.product_id = p.id
                          WHERE oi.order_id = :oid", [':oid' => $orderId]);

    return ['order' => $order, 'items' => $items];
}

}
