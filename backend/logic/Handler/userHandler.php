<?php
require_once __DIR__ . '/../../models/users.class.php';

class userHandler {
    private User $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function handle(string $action, array $input): array {
        switch ($action) {
            case 'listUsers':
                return $this->listUsers();

            case 'toggleUserStatus':
                return $this->toggleUserStatus($input['id'] ?? null);

            case 'getOrders':
                return $this->getOrders($input['userId'] ?? null);

            default:
                return ['success' => false, 'error' => 'Unbekannte Aktion: ' . $action];
        }
    }

    private function listUsers(): array {
        try {
            $users = $this->userModel->getAllUsers();
            return ['success' => true, 'users' => $users];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function toggleUserStatus(?int $id): array {
        if (!$id) return ['success' => false, 'message' => 'Kunden-ID fehlt.'];

        $current = $this->userModel->getById($id);
        if (!$current) return ['success' => false, 'message' => 'Kunde nicht gefunden.'];

        $newStatus = $this->userModel->toggleUserStatus($id);
        if ($newStatus === null) {
            return ['success' => false, 'message' => 'Konnte Status nicht ändern.'];
        }

        $wasActive = (int)$current['is_active'] === 1;

        return [
            'success' => true,
            'message' => $wasActive
                ? 'Kunde wurde deaktiviert.'
                : 'Kunde wurde aktiviert.'
        ];
    }

    private function getOrders(?int $userId): array {
        if (!$userId) {
            return ['success' => false, 'message' => 'Kunden-ID fehlt.'];
        }

        $orders = $this->userModel->getOrdersByUserId($userId);
        if ($orders !== null) {
            return ['success' => true, 'orders' => $orders];
        } else {
            return ['success' => false, 'message' => 'Keine Bestellungen gefunden.'];
        }
    }
}
