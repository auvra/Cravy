<?php
class dbaccess {
    private $pdo;
    private static $instance = null;

    private function __construct() {
        $host = 'localhost';
        $dbname = 'cravy';
        $user = 'root';
        $pass = ''; 

        try {
            $this->pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Verbindung fehlgeschlagen: " . $e->getMessage());
        }
    }

    // Singleton-Pattern
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new dbaccess();
        }
        return self::$instance;
    }

    // SELECT
    public function select($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // INSERT, UPDATE, DELETE
    public function execute($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    // Letzter Insert-ID (z. B. nach User-Registrierung)
    public function getLastInsertId() {
        return $this->pdo->lastInsertId();
    }

    // Gibt genau einen Datensatz zurück
    public function getSingle($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

}