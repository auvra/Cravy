<?php
$pdo = new PDO("mysql:host=localhost;dbname=cravy", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$query = "SELECT * FROM products ORDER BY created_at DESC";
$stmt = $pdo->prepare($query);
$stmt->execute();

$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Typumwandlung: price und rating als float casten
foreach ($products as &$product) {
    $product['price'] = (float) $product['price'];
    $product['rating'] = isset($product['rating']) ? (float) $product['rating'] : null;
}
unset($product);

// Kategorien abrufen (distinct)
$queryCategories = "SELECT DISTINCT category FROM products ORDER BY category ASC";
$stmtCategories = $pdo->prepare($queryCategories);
$stmtCategories->execute();
$categories = $stmtCategories->fetchAll(PDO::FETCH_COLUMN);

header('Content-Type: application/json');
echo json_encode([
    'products' => $products,
    'categories' => $categories
]);