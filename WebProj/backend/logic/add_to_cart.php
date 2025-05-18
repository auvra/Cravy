<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nicht eingeloggt']);
    exit;
}

$userId = $_SESSION['user_id'];

$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action'] ?? 'add';
$productId = isset($input['productId']) ? (int)$input['productId'] : 0;
$quantity = isset($input['quantity']) ? (int)$input['quantity'] : 1;

try {
    $pdo = new PDO("mysql:host=localhost;dbname=cravy", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($action === 'add') {
        if ($productId <= 0 || $quantity <= 0) {
            echo json_encode(['success' => false, 'message' => 'Ungültige Produktdaten']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM order_items WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $stmt = $pdo->prepare("UPDATE order_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$quantity, $userId, $productId]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO order_items (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $productId, $quantity]);
        }

        $stmt = $pdo->prepare("SELECT SUM(quantity) AS total FROM order_items WHERE user_id = ?");
        $stmt->execute([$userId]);
        $totalItems = (int) $stmt->fetchColumn();

        echo json_encode([
            'success' => true,
            'message' => 'Produkt zum Warenkorb hinzugefügt',
            'cartCount' => $totalItems
        ]);

    } elseif ($action === 'update') {
        if ($productId <= 0) {
            echo json_encode(['success' => false, 'message' => 'Ungültige Produkt-ID']);
            exit;
        }

        if ($quantity > 0) {
            $stmt = $pdo->prepare("UPDATE order_items SET quantity = ? WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$quantity, $userId, $productId]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM order_items WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$userId, $productId]);
        }

        echo json_encode(['success' => true, 'message' => 'Warenkorb aktualisiert']);

    } elseif ($action === 'get') {
        $sql = "
            SELECT oi.product_id, oi.quantity, p.name, p.price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.user_id = ?
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "items" => $items]);

    } else {
        echo json_encode(['success' => false, 'message' => 'Ungültige Aktion']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Fehler: ' . $e->getMessage()]);
}
