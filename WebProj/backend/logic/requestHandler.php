<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require_once(__DIR__ . '/../config/dbaccess.php');

header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? null;

switch ($action) {
    case 'login':
        login();
        break;
    case 'logout':
        logout();
        break;
    case 'check_login':
        checkLoginStatus();
        break;
    default:
        echo json_encode(["success" => false, "message" => "Ungültige Aktion."]);
        break;
}


// Zu authHandler?
function login() {
    $db = dbaccess::getInstance();
    $login = $_POST['loginCredentials'] ?? '';
    $password = $_POST['password'] ?? '';
    $remember = $_POST['remember'] === 'true';

    $sql = "SELECT * FROM users WHERE username = :login OR email = :login";
    $user = $db->getSingle($sql, [':login' => $login]);

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_admin'] = $user['is_admin'];

        if ($remember) {
            setcookie("remember_me", $user['id'], time() + (30 * 24 * 60 * 60), "/");
        }

        echo json_encode([
            "success" => true,
            "is_admin" => $user['is_admin'] == 1
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "❌ Benutzername oder Passwort falsch."
        ]);
    }
}


function logout() {
    session_unset();
    session_destroy();
    setcookie("remember_me", "", time() - 3600, "/");
    echo json_encode(["success" => true]);
}

function checkLoginStatus() {
    $db = dbaccess::getInstance();

    if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_me'])) {
        $userId = $_COOKIE['remember_me'];
        $user = $db->getSingle("SELECT * FROM users WHERE id = :id", [':id' => $userId]);

        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
        }
    }

    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            "loggedIn" => true,
            "username" => $_SESSION['username']
        ]);
    } else {
        echo json_encode(["loggedIn" => false]);
    }
}
?>
