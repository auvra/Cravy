<?php
class productHandler {
    /*
      Main dispatcher for product-related actions
      @param string $action
      @param array  $input
      @return array
     */
    public function handle(string $action, array $input): array {
        switch ($action) {
            case 'getProducts':
                return $this->getProducts();

            case 'getProduct':
                $id = isset($input['productId']) ? (int) $input['productId'] : 0;
                return $this->getProduct($id);

            case 'createProduct':
                return $this->createProduct($input);

            case 'updateProduct':
                return $this->updateProduct($input);

            case 'deleteProduct':
                $id = isset($input['productId']) ? (int) $input['productId'] : 0;
                return $this->deleteProduct($id);

            case 'deleteImage':
                $id = isset($input['imageId']) ? (int) $input['imageId'] : 0;
                return $this->deleteImage($id);

            case 'searchProducts':
                $q = $input['query'] ?? '';
                return $this->searchProducts($q);

            case 'getProductsByCategory':
                $catId = isset($input['categoryId']) ? (int) $input['categoryId'] : 0;
                return $this->getProductsByCategory($catId);

            default:
                return [
                    'success' => false,
                    'error'   => "Unknown action: \$action"
                ];
        }
    }

    // Fetch all products and categories
    private function getProducts(): array {
        try {
            // Direkt mit PDO verbinden (alternativ: dbaccess verwenden)
            $pdo = new PDO("mysql:host=localhost;dbname=cravy", "root", "");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Produkte abrufen
            $sql = "SELECT * FROM products ORDER BY created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Preis und Rating typkonvertieren
            foreach ($products as &$p) {
                $p['price']  = (float) $p['price'];
                $p['rating'] = isset($p['rating']) ? (float) $p['rating'] : null;
            }
            unset($p);

            // Kategorien abrufen
            $sqlCat = "SELECT DISTINCT category FROM products ORDER BY category ASC";
            $stmtC  = $pdo->prepare($sqlCat);
            $stmtC->execute();
            $categories = $stmtC->fetchAll(PDO::FETCH_COLUMN);

            return [
                'success'    => true,
                'products'   => $products,
                'categories' => $categories
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error'   => $e->getMessage()
            ];
        }
    }

    // Fetch a single product by ID
     
    private function getProduct(int $id): array {
        if ($id <= 0) {
            return ['success' => false, 'error' => 'Invalid product ID'];
        }
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=cravy", "root", "");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $sql = "SELECT * FROM products WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                return ['success' => false, 'error' => 'Product not found'];
            }
            // Typkonvertierung
            $product['price']  = (float) $product['price'];
            $product['rating'] = isset($product['rating']) ? (float) $product['rating'] : null;

            return ['success' => true, 'product' => $product];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // Stub: Create a new product
     
    private function createProduct(array $data): array {
        // TODO: Implement create logic
        return ['success' => false, 'error' => 'createProduct not implemented'];
    }

    // Stub: Update an existing product
     
    private function updateProduct(array $data): array {
        // TODO: Implement update logic
        return ['success' => false, 'error' => 'updateProduct not implemented'];
    }

    // Stub: Delete a product by ID

    private function deleteProduct(int $id): array {
        // TODO: Implement delete logic
        return ['success' => false, 'error' => 'deleteProduct not implemented'];
    }

    // Stub: Delete an image by ID
     
    private function deleteImage(int $imageId): array {
        // TODO: Implement image delete logic
        return ['success' => false, 'error' => 'deleteImage not implemented'];
    }

    // Search products by a query string
     
    private function searchProducts(string $query): array {
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=cravy", "root", "");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $sql = "SELECT * FROM products
                    WHERE name LIKE :q OR description LIKE :q
                    ORDER BY created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':q' => "%{$query}%"]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($results)) {
                return ['success' => false, 'error' => 'No matching products'];
            }

            foreach ($results as &$p) {
                $p['price']  = (float) $p['price'];
                $p['rating'] = isset($p['rating']) ? (float) $p['rating'] : null;
            }
            unset($p);

            return ['success' => true, 'products' => $results];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // Get products filtered by category ID

    private function getProductsByCategory(int $categoryId): array {
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=cravy", "root", "");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $sql = "SELECT * FROM products WHERE category_id = :cat ORDER BY created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':cat' => $categoryId]);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($products)) {
                return ['success' => false, 'error' => 'No products in this category'];
            }

            foreach ($products as &$p) {
                $p['price']  = (float) $p['price'];
                $p['rating'] = isset($p['rating']) ? (float) $p['rating'] : null;
            }
            unset($p);

            return ['success' => true, 'products' => $products];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}