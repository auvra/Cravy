<?php
// backend/logic/Handler/orderHandler.php

class orderHandler
{
  public function handle(string $action, array $input): array
  {
    switch ($action) {
      case 'createOrder':
        return $this->createOrder($input);
      case 'getOrders':
        return $this->getOrders();
      case 'getOrder':
        $id = isset($input['orderId']) ? (int) $input['orderId'] : 0;
        return $this->getOrder($id);
      default:
        return ['success' => false, 'error' => "Unknown action: $action"];
    }
  }

  private function createOrder(array $input): array
  {
    try {
      $userId = $_SESSION['user_id'];
      $pm = $input['paymentMethod'] ?? null;
      $vc = $input['voucherCode'] ?? null;

      $db = dbaccess::getInstance();
      $db->execute("START TRANSACTION");

      //Fetch all cart items for this user
      $items = $db->select(
        "SELECT c.product_id, c.quantity, c.price_at_time AS price, p.price AS current_price
             FROM cart c
             JOIN products p ON p.id = c.product_id
            WHERE c.user_id = ?",
        [$userId]
      );
      if (!$items) {
        throw new Exception("Warenkorb ist leer.");
      }

      // Calculate total
      $total = 0;
      foreach ($items as $it) {
        $total += $it['price'] * $it['quantity'];
      }

      // Apply voucher if provided
      $voucherId = null;
      if ($vc) {
        $v = $db->getSingle(
          "SELECT * FROM vouchers 
                   WHERE code = ? AND is_active = 1",
          [$vc]
        );
        if (!$v)
          throw new Exception("Ungültiger Gutschein.");
        $voucherId = $v['id'];
        $discount = min($v['value'], $total);
        $total -= $discount;
        // Deduct from voucher
        $db->execute(
          "UPDATE vouchers 
                      SET value = value - ? 
                    WHERE id = ?",
          [$discount, $voucherId]
        );
      }

      /// Insert into orders
        $db->execute(
          "INSERT INTO orders (user_id, total, payment_method, voucher_id, created_at)
           VALUES (?, ?, ?, ?, NOW())",
          [$userId, $total, $pm, $voucherId]
        );
        $orderId = $db->getLastInsertId();

        foreach ($items as $it) {
            $price = $it['price'] ?? $it['current_price'];
            $db->execute(
                "INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES (?, ?, ?, ?)",
                [$orderId, $it['product_id'], $it['quantity'], $price]
            );
        }

      // Delete cart items
       $db->execute(
              "DELETE FROM cart 
                WHERE user_id = ?",
              [$userId]
            );

      $db->execute("COMMIT");
      return ['success' => true, 'orderId' => $orderId];

    } catch (Exception $e) {
      $db->execute("ROLLBACK");
      return ['success' => false, 'error' => $e->getMessage()];
    }



  }

  private function getOrders(): array
  {
    $userId = $_SESSION['user_id'];
    $db = dbaccess::getInstance();

    $orders = $db->select(
      "SELECT id, total, payment_method, voucher_id, created_at
             FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC",
      [$userId]
    );
    return ['success' => true, 'orders' => $orders];
  }

  private function getOrder(int $orderId): array
  {
    $userId = $_SESSION['user_id'];
    $db = dbaccess::getInstance();

    // Fetch the order header
    $order = $db->getSingle(
      "SELECT id, total, payment_method, voucher_id, created_at
             FROM orders
            WHERE id = ? AND user_id = ?",
      [$orderId, $userId]
    );
    if (!$order) {
      return ['success' => false, 'error' => 'Bestellung nicht gefunden'];
    }

    // Fetch its line items from cart table
    $items = $db->select(
      "SELECT c.product_id, c.quantity, c.price_at_time AS price, p.name
             FROM cart c
             JOIN products p ON p.id = c.product_id
            WHERE c.order_id = ?",
      [$orderId]
    );

    return ['success' => true, 'order' => $order, 'items' => $items];
  }
}
