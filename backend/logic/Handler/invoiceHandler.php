<?php
require_once __DIR__ . '/../../models/order.class.php';
header('Content-Type: application/json');

if (!isset($_GET['order_id'])) {
    echo json_encode(['success' => false, 'error' => 'Keine Bestell-ID angegeben.']);
    exit;
}

$orderId = (int)$_GET['order_id'];
$orderObj = new Order();
$data = $orderObj->getInvoiceData($orderId);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Rechnung nicht gefunden.']);
    exit;
}

echo json_encode([
    'success' => true,
    'order' => $data['order'],
    'items' => $data['items']
]);
