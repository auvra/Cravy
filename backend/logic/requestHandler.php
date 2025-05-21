<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/dbaccess.php';

// ──────────────────────────────────────────────────────────────────────────────
// READ INPUT & DETERMINE ACTION
// ──────────────────────────────────────────────────────────────────────────────

// 1) Read raw request body
$rawInput = file_get_contents('php://input');

// 2) Try to decode JSON
$parsed = json_decode($rawInput, true);

// 3) If valid JSON, use it; otherwise fall back to GET/POST
if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
    $input = $parsed;
} else {
    // Merge GET and POST parameters as fallback
    $input = array_merge($_GET, $_POST);
}

$action  = $input['action'] ?? null;
$handler = null;

switch ($action) {

    // Authentication
    case 'login':
    case 'logout':
    case 'check_login':
    case 'register':
        require_once __DIR__ . '/Handler/authHandler.php';
        $handler = new authHandler();
        break;

    // Products
    case 'getProducts':
    case 'getProduct':
    case 'createProduct':
    case 'updateProduct':
    case 'deleteProduct':
    case 'deleteImage':
    case 'searchProducts':
    case 'getProductsByCategory':
        require_once __DIR__ . '/Handler/productHandler.php';
        $handler = new productHandler();
        break;

    // User management (admin)
    case 'getUserData':
    case 'listUsers':
    case 'toggleUserStatus':
    require_once __DIR__ . '/Handler/userHandler.php';
    $handler = new userHandler(); 
    break;


    // Cart (must be logged in)
    case 'add_to_cart':
    case 'get_cart':
    case 'update_cart':
    case 'remove_from_cart':
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
        require_once __DIR__ . '/Handler/cartHandler.php';
        $handler = new cartHandler();
        break;

    // Orders
    case 'createOrder':
    case 'getOrders':
    case 'getOrder':
        if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success'=>false,'error'=>'Unauthorized']);
        exit;
    }
    require_once __DIR__ . '/Handler/orderHandler.php';
    $handler = new orderHandler();
    break;

    // Voucher
    case 'createVoucher':
    case 'listVouchers':
    case 'deleteVoucher':
    case 'validateVoucher':
    require_once __DIR__ . '/Handler/voucherHandler.php';
    $handler = new voucherHandler();
    break;

}

// If no handler was matched, return an error
if (!$handler) {
    echo json_encode([
        'success' => false,
        'error'   => 'Invalid action: ' . ($action ?? 'none')
    ]);
    exit;
}

$response = $handler->handle($action, $input);

echo json_encode($response);
