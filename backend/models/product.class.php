<?php
require_once(__DIR__ . '/../config/dbaccess.php');

class Product {
    private $db;

    public function __construct() {
        $this->db = dbaccess::getInstance();
    }

    public function getAllProducts() {
        $sql = "SELECT * FROM products ORDER BY created_at DESC";
        return $this->db->select($sql);
    }

    public function getProductsByCategory($categoryName) {
        $sql = "SELECT * FROM products WHERE category = ?";
        return $this->db->select($sql, [$categoryName]);
    }

    public function getProductById($id) {
        $sql = "SELECT * FROM products WHERE id = :id";
        return $this->db->select($sql, [':id' => $id])[0] ?? null;
    }

    public function createProduct($data) {
        $sql = "INSERT INTO products (
            name, description, price, image_path,
            rating, category, created_at
        ) VALUES (
            :name, :description, :price, :image_path,
            :rating, :category, NOW()
        )";
        return $this->db->execute($sql, [
            ':name'        => $data['name'],
            ':description' => $data['description'],
            ':price'       => $data['price'],
            ':image_path'  => $data['image_path'] ?? null,
            ':rating'      => $data['rating'] ?? null,
            ':category'    => $data['category']
        ]);
    }

    public function updateProduct($data) {
        $sql = "UPDATE products SET
            name = :name,
            description = :description,
            price = :price,
            image_path = :image_path,
            rating = :rating,
            category = :category
            WHERE id = :id";
        return $this->db->execute($sql, $data);
    }

    public function deleteProduct($id) {
        $sql = "DELETE FROM products WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }

    public function searchProducts(string $query) {
        $sql = "SELECT * FROM products 
                WHERE name LIKE :q OR description LIKE :q
                ORDER BY created_at DESC";
        $params = [':q' => '%' . $query . '%'];
        return $this->db->select($sql, $params);
    }

    public function getAllCategories() {
        $sql = "SELECT DISTINCT category FROM products ORDER BY category ASC";
        return $this->db->select($sql);
    }
}
