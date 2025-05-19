<?php
// backend/logic/Handler/cartHandler.php

class cartHandler {
    public function handle(string $action, array $input): array {
        switch ($action) {
            case 'add_to_cart':
                $pid = (int)($input['productId'] ?? 0);
                $qty = (int)($input['quantity']  ?? 1);
                return $this->addToCart($pid, $qty);

            case 'get_cart':
                return $this->getCart();

            case 'update_cart':
                $pid = (int)($input['productId'] ?? 0);
                $qty = (int)($input['quantity']  ?? 0);
                return $this->updateCart($pid, $qty);

            case 'remove_from_cart':
                $pid = (int)($input['productId'] ?? 0);
                return $this->removeFromCart($pid);

            default:
                return ['success'=>false,'error'=>"Unknown action: $action"];
        }
    }

    private function getConnection(): PDO {
        $pdo = new PDO("mysql:host=localhost;dbname=cravy;charset=utf8mb4","root","");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    }

    private function addToCart(int $productId, int $quantity): array {
        if ($productId<=0||$quantity<=0) {
            return ['success'=>false,'error'=>'Ungültige Produktdaten'];
        }
        try {
            $userId = $_SESSION['user_id'];
            $pdo    = $this->getConnection();

            // check if exists in cart table
            $stmt = $pdo->prepare(
              "SELECT quantity 
                 FROM cart 
                WHERE user_id = ? AND product_id = ?"
            );
            $stmt->execute([$userId,$productId]);
            $exists = $stmt->fetchColumn();

            if ($exists!==false) {
                // update existing
                $stmt = $pdo->prepare(
                  "UPDATE cart 
                      SET quantity = quantity + ? 
                    WHERE user_id = ? AND product_id = ?"
                );
                $stmt->execute([$quantity,$userId,$productId]);
            } else {
                // insert new
                $stmt = $pdo->prepare(
                  "INSERT INTO cart (user_id,product_id,quantity,price_at_time)
                   VALUES (?, ?, ?, 
                     (SELECT price FROM products WHERE id = ?)
                   )"
                );
                // capture price_at_time as well
                $stmt->execute([$userId,$productId,$quantity,$productId]);
            }

            // return updated cart count
            $stmt = $pdo->prepare(
              "SELECT SUM(quantity) 
                 FROM cart 
                WHERE user_id = ?"
            );
            $stmt->execute([$userId]);
            $total = (int)$stmt->fetchColumn();

            return ['success'=>true,'message'=>'Added to cart','cartCount'=>$total];

        } catch(PDOException $e) {
            return ['success'=>false,'error'=>$e->getMessage()];
        }
    }

    private function getCart(): array {
        try {
            $userId = $_SESSION['user_id'];
            $pdo    = $this->getConnection();

            $stmt = $pdo->prepare(
              "SELECT c.product_id, c.quantity, p.name, p.price, p.image_path
                 FROM cart AS c
                 JOIN products AS p ON c.product_id = p.id
                WHERE c.user_id = ?"
            );
            $stmt->execute([$userId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as &$i) {
                $i['price'] = (float)$i['price'];
            }
            unset($i);

            return ['success'=>true,'cart'=>$items];

        } catch(PDOException $e) {
            return ['success'=>false,'error'=>$e->getMessage()];
        }
    }

    private function updateCart(int $productId, int $quantity): array {
        if ($productId<=0) {
            return ['success'=>false,'error'=>'Ungültige Produkt-ID'];
        }
        try {
            $userId = $_SESSION['user_id'];
            $pdo    = $this->getConnection();

            if ($quantity>0) {
                $stmt = $pdo->prepare(
                  "UPDATE cart 
                      SET quantity = ? 
                    WHERE user_id = ? AND product_id = ?"
                );
                $stmt->execute([$quantity,$userId,$productId]);
            } else {
                $stmt = $pdo->prepare(
                  "DELETE FROM cart 
                    WHERE user_id = ? AND product_id = ?"
                );
                $stmt->execute([$userId,$productId]);
            }

            return ['success'=>true,'message'=>'Cart updated'];

        } catch(PDOException $e) {
            return ['success'=>false,'error'=>$e->getMessage()];
        }
    }

    private function removeFromCart(int $productId): array {
        // simply delete
        return $this->updateCart($productId, 0);
    }
}
