<?php
session_start();
require_once __DIR__ . '/../../models/users.class.php';
require_once __DIR__ . '/../../models/order.class.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Nicht eingeloggt']);
    exit;
}

$userId = $_SESSION['user_id'];
$userObj = new User();
$orderObj = new Order();

switch ($_GET['action'] ?? '') {
    case 'getUserData':
        $user = User::getById($userId);
        if ($user) {
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden']);
        }
        break;

    case 'updateUser':
        $required = ['firstname', 'lastname', 'address', 'email', 'password'];
        foreach ($required as $f) {
            if (empty($_POST[$f])) {
                echo json_encode(['success' => false, 'error' => 'Alle Felder sind erforderlich.']);
                exit;
            }
        }

        $result = $userObj->updateUserWithPassword(
            $userId,
            $_POST['firstname'],
            $_POST['lastname'],
            $_POST['address'],
            $_POST['email'],
            $_POST['password']
        );

        echo json_encode($result ? ['success' => true] : ['success' => false, 'error' => 'Passwort falsch oder Fehler beim Speichern.']);
        break;

    case 'getOrders':
        $orders = $userObj->getOrdersByUserId($userId);
        echo json_encode(['success' => true, 'orders' => $orders]);
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Ungültige Aktion']);
}
