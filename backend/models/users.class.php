<?php
require_once __DIR__ . '/../config/dbaccess.php';

class User {

    public static function register(array $data): array {
        $required = ['salutation', 'firstname', 'lastname', 'address', 'zip', 'city', 'email', 'username', 'password', 'confirm_password'];

        foreach ($required as $f) {
            if (empty($data[$f])) {
                return ['success' => false, 'error' => 'Bitte füllen Sie alle Pflichtfelder aus.'];
            }
        }

        if ($data['password'] !== $data['confirm_password']) {
            return ['success' => false, 'error' => 'Die Passwörter stimmen nicht überein.'];
        }

        $db = dbaccess::getInstance();

        $check = $db->getSingle("SELECT id FROM users WHERE username = :u OR email = :e", [
            ':u' => $data['username'],
            ':e' => $data['email']
        ]);
        if ($check) {
            return ['success' => false, 'error' => 'Benutzername oder E-Mail existiert bereits.'];
        }

        $sql = "INSERT INTO users (salutation, firstname, lastname, address, zip, city, email, username, password_hash, payment_info, is_admin, is_active)
                VALUES (:sal, :fn, :ln, :adr, :zip, :cty, :em, :un, :pw, :pi, 0, 1)";
        $params = [
            ':sal' => $data['salutation'],
            ':fn'  => $data['firstname'],
            ':ln'  => $data['lastname'],
            ':adr' => $data['address'],
            ':zip' => $data['zip'],
            ':cty' => $data['city'],
            ':em'  => $data['email'],
            ':un'  => $data['username'],
            ':pw'  => password_hash($data['password'], PASSWORD_DEFAULT),
            ':pi'  => $data['payment_info'] ?? ''
        ];

        $ok = $db->execute($sql, $params);
        return $ok
            ? ['success' => true, 'message' => '✅ Registrierung erfolgreich!']
            : ['success' => false, 'error' => '❌ Registrierung fehlgeschlagen.'];
    }

    public static function login(string $login, string $password, bool $remember): array {
        $db = dbaccess::getInstance();
        $sql = "SELECT * FROM users WHERE username = :login OR email = :login";
        $user = $db->getSingle($sql, [':login' => $login]);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return ['success' => false, 'error' => 'Benutzername oder Passwort falsch.'];
        }

        if ((int)$user['is_active'] === 0) {
            return ['success' => false, 'error' => 'Dein Account ist gesperrt. Kontaktieren Sie bitte den Support.'];
        }


        $_SESSION['user_id']  = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_admin'] = $user['is_admin'];

        if ($remember) {
            setcookie('remember_me', $user['id'], time() + 30*24*60*60, '/');
        }

        return [
            'success'  => true,
            'user_id'  => $user['id'],
            'username' => $user['username'],
            'is_admin' => $user['is_admin']
        ];
    }
    
    public static function requireAdmin(): void {
        if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== 1) {
            header('Location: /error/403');
            exit;
        }
    }

    public static function logout(): array {
        session_unset();
        session_destroy();
        setcookie('remember_me', '', time() - 3600, '/');
        return ['success' => true];
    }

    public static function checkLoginStatus(): array {
        if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_me'])) {
            $user = self::getById((int)$_COOKIE['remember_me']);
            if ($user) {
                $_SESSION['user_id']  = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['is_admin'] = $user['is_admin'];
            }
        }

        if (isset($_SESSION['user_id'])) {
            return [
                'success'  => true,
                'loggedIn' => true,
                'user_id'  => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'is_admin' => $_SESSION['is_admin']
            ];
        }

        return ['success' => true, 'loggedIn' => false];
    }

    public static function getById(int $id): ?array {
        $db = dbaccess::getInstance();
        return $db->getSingle("SELECT * FROM users WHERE id = :id", [':id' => $id]) ?: null;
    }

    // ============ ADMIN-FUNKTIONEN ============

    public function getAllUsers(): array {
        $db = dbaccess::getInstance();
        $sql = "SELECT * FROM users WHERE is_admin = 0 ORDER BY lastname ASC";
        return $db->select($sql);
    }

   public function toggleUserStatus(int $userId): ?bool {
    $db = dbaccess::getInstance();

    // Aktuellen Status abrufen
    $user = $db->getSingle("SELECT is_active FROM users WHERE id = :id", [':id' => $userId]);
    if (!$user) return null;

    $currentStatus = (int)$user['is_active'];
    $newStatus = $currentStatus === 1 ? 0 : 1;

    // Status aktualisieren
    $success = $db->execute("UPDATE users SET is_active = :s WHERE id = :id", [
        ':s' => $newStatus,
        ':id' => $userId
    ]);

    // Gib den NEUEN Wert zurück
    return $success ? (bool)$newStatus : null;
}



    public function getOrdersByUserId(int $userId): array {
        $db = dbaccess::getInstance();

        $orders = $db->select("SELECT * FROM orders WHERE user_id = :id", [':id' => $userId]);


        return $orders;
    }

    public function deleteOrderItem(int $itemId): bool {
        $db = dbaccess::getInstance();
        return $db->execute("DELETE FROM order_items WHERE id = ?", [$itemId]);
    }

    public function updateOrderItemQuantity(int $itemId, int $quantity): bool {
        if ($quantity < 1) return false;
        $db = dbaccess::getInstance();
        return $db->execute("UPDATE order_items SET quantity = ? WHERE id = ?", [$quantity, $itemId]);
    }
}
