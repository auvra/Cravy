<?php
require_once __DIR__ . '/../../models/product.class.php';

class productHandler {
    private Product $productModel;

    public function __construct() {
        $this->productModel = new Product();
    }

    public function handle(string $action, array $input): array {
        switch ($action) {
            case 'getProducts':
                return $this->getProducts();

            case 'getProduct':
                $id = (int)($input['productId'] ?? $input['id'] ?? 0);
                return $this->getProduct($id);

            case 'createProduct':
                return $this->createProduct($input);

            case 'updateProduct':
                return $this->updateProduct($input);

            case 'deleteProduct':
                $id = (int)($input['productId'] ?? $input['id'] ?? 0);
                return $this->deleteProduct($id);

            case 'deleteImage':
                $id = (int)($input['imageId'] ?? $input['id'] ?? 0);
                return $this->deleteImage($id);

            case 'searchProducts':
                $q = trim($input['query'] ?? '');
                return $this->searchProducts($q);

            case 'getProductsByCategory':
                $cat = $input['category'] ?? '';
                return $this->getProductsByCategory($cat);

            default:
                return ['success' => false, 'error' => "Unknown action: $action"];
        }
    }

    private function getProducts(): array {
        try {
            $products = $this->productModel->getAllProducts();
            $categories = array_unique(array_column($products, 'category'));
            return [
                'success' => true,
                'products' => $products,
                'categories' => $categories
            ];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function getProduct(int $id): array {
        if ($id <= 0) return ['success' => false, 'error' => 'Invalid product ID'];
        $product = $this->productModel->getProductById($id);
        return $product
            ? ['success' => true, 'product' => $product]
            : ['success' => false, 'error' => 'Product not found'];
    }

    private function createProduct(array $data): array {
        try {
            $required = ['name', 'description', 'price', 'category'];
            foreach ($required as $field) {
                if (empty($_POST[$field])) {
                    return ['success' => false, 'error' => "Feld '$field' ist erforderlich."];
                }
            }

            $imagePath = null;
            if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../productpictures/';
                $filename = basename($_FILES['image']['name']);
                $targetPath = $uploadDir . $filename;

                if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    return ['success' => false, 'error' => 'Bild konnte nicht gespeichert werden.'];
                }

                $imagePath = $filename;
            }

            $productData = [
                'name'        => $_POST['name'],
                'description' => $_POST['description'],
                'price'       => (float)$_POST['price'],
                'image_path'  => $imagePath,
                'rating'      => $_POST['rating'] ?? null,
                'category'    => $_POST['category']
            ];

            $success = $this->productModel->createProduct($productData);

            return $success
                ? ['success' => true, 'message' => 'Produkt erfolgreich erstellt!']
                : ['success' => false, 'error' => 'Datenbankfehler bei Erstellung.'];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function updateProduct(array $data): array {
        if (empty($_POST['id'])) {
            return ['success' => false, 'error' => 'ID fehlt für Update'];
        }

        try {
            $id = (int)$_POST['id'];

            $required = ['name', 'description', 'price', 'category'];
            foreach ($required as $field) {
                if (empty($_POST[$field])) {
                    return ['success' => false, 'error' => "Feld '$field' ist erforderlich."];
                }
            }

            $imagePath = null;
            if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../productpictures/';
                $filename = basename($_FILES['image']['name']);
                $targetPath = $uploadDir . $filename;


                if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    return ['success' => false, 'error' => 'Bild konnte nicht gespeichert werden.'];
                }

                $imagePath = $filename;
            }

            $existing = $this->productModel->getProductById($id);
            $updateData = [
                ':id'          => $id,
                ':name'        => $_POST['name'],
                ':description' => $_POST['description'],
                ':price'       => (float)$_POST['price'],
                ':rating'      => $_POST['rating'] ?? null,
                ':category'    => $_POST['category'],
                ':image_path'  => $imagePath ?? $existing['image_path']
            ];

            $success = $this->productModel->updateProduct($updateData);

            return $success
                ? ['success' => true, 'message' => 'Produkt erfolgreich aktualisiert.']
                : ['success' => false, 'error' => 'Aktualisierung fehlgeschlagen.'];

    // Search products by a query string
     
    private function searchProducts(string $query): array {
    if ($query === '') {
        return ['success'=>false,'error'=>'Empty search query'];
    }


    $db = dbaccess::getInstance();
    $sql = "
      SELECT * 
        FROM products
       WHERE name LIKE :q
          OR description LIKE :q
       ORDER BY created_at DESC
    ";
    $params = [':q' => "%{$query}%"];
    $products = $db->select($sql, $params);

    // cast numeric fields
    foreach ($products as &$p) {
        $p['price']  = (float)$p['price'];
        $p['rating'] = isset($p['rating']) ? (float)$p['rating'] : null;
    }
    unset($p);

    return [
      'success'  => true,
      'products' => $products
    ];
}

    private function deleteProduct(int $id): array {
        if ($id <= 0) return ['success' => false, 'error' => 'Ungültige Produkt-ID'];

        try {
            $product = $this->productModel->getProductById($id);
            $imagePath = $product['image_path'] ?? null;

            if ($imagePath) {
                $file = __DIR__ . '/../../productpictures/' . $imagePath;
                if (file_exists($file)) {
                    unlink($file);
                }
            }

            $success = $this->productModel->deleteProduct($id);
            return $success
                ? ['success' => true, 'message' => 'Produkt gelöscht']
                : ['success' => false, 'error' => 'Produkt konnte nicht gelöscht werden'];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function searchProducts(string $query): array {
        $results = $this->productModel->searchProducts($query);
        return count($results)
            ? ['success' => true, 'products' => $results]
            : ['success' => false, 'error' => 'Keine passenden Produkte gefunden'];
    }

    private function getProductsByCategory(string $category): array {
        if (empty($category)) {
            return ['success' => false, 'error' => 'Kategorie fehlt'];
        }
        $products = $this->productModel->getProductsByCategory($category);
        return count($products)
            ? ['success' => true, 'products' => $products]
            : ['success' => false, 'error' => 'Keine Produkte in dieser Kategorie'];
    }
}
