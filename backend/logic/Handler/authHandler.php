<?php
// backend/logic/Handler/authHandler.php

class authHandler {
    /**
     * Dispatch authentication actions
     */
    public function handle(string $action, array $input): array {
        switch ($action) {
            case 'login':
                $login    = $input['loginCredentials'] ?? '';
                $password = $input['password']         ?? '';
                $remember = ($input['remember'] ?? false) === true;
                return $this->login($login, $password, $remember);

            case 'logout':
                return $this->logout();

            case 'check_login':
                return $this->checkLoginStatus();

            default:
                return [
                    'success' => false,
                    'error'   => "Unknown action: $action"
                ];
        }
    }

    /**
     * Handle user login
     */
    private function login(string $login, string $password, bool $remember): array {
        try {
            $db   = dbaccess::getInstance();
            $sql  = "SELECT * FROM users WHERE username = :login OR email = :login";
            $user = $db->getSingle($sql, [':login' => $login]);

            if (!$user || !password_verify($password, $user['password_hash'])) {
                return [
                    'success' => false,
                    'error'   => 'Benutzername oder Passwort falsch.'
                ];
            }

            // Session setzen
            $_SESSION['user_id']  = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['is_admin'] = $user['is_admin'];

            if ($remember) {
                setcookie('remember_me', $user['id'], time() + 30*24*60*60, '/');
            }

            return [
                'success'  => true,
                'user_id'  => (int)$user['id'],
                'username' => $user['username'],
                'is_admin' => (int)$user['is_admin']
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error'   => $e->getMessage()
            ];
        }
    }

    /**
     * Handle user logout
     */
    private function logout(): array {
        session_unset();
        session_destroy();
        setcookie('remember_me', '', time() - 3600, '/');
        return [ 'success' => true ];
    }

    /**
     * Check login status, restore from cookie if needed
     */
    private function checkLoginStatus(): array {
        try {
            if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_me'])) {
                $db   = dbaccess::getInstance();
                $sql  = "SELECT * FROM users WHERE id = :id";
                $user = $db->getSingle($sql, [':id' => $_COOKIE['remember_me']]);
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
                    'user_id'  => (int)$_SESSION['user_id'],
                    'username' => $_SESSION['username'],
                    'is_admin' => (int)($_SESSION['is_admin'] ?? 0)
                ];
            }

            return [ 'success' => true, 'loggedIn' => false ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error'   => $e->getMessage()
            ];
        }
    }
}
