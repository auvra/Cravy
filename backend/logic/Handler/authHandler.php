<?php
require_once __DIR__ . '/../../models/users.class.php';

class authHandler {
    public function handle(string $action, array $input): array {
        switch ($action) {
            case 'register':
                return User::register($input);

            case 'login':
                $login    = $input['loginCredentials'] ?? '';
                $password = $input['password'] ?? '';
                $remember = ($input['remember'] ?? false) === true;
                return User::login($login, $password, $remember);

            case 'logout':
                return User::logout();

            case 'check_login':
                return User::checkLoginStatus();

            default:
                return ['success' => false, 'error' => "Unknown action: $action"];
        }
    }
}
