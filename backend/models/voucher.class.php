<?php
require_once __DIR__ . '/../config/dbaccess.php';

class Voucher {
  private $db;

  public function __construct() {
    $this->db = dbaccess::getInstance();
  }

  public function create(string $code, float $value, ?string $validUntil = null): bool {
    $sql = "INSERT INTO vouchers (code, value, valid_until) VALUES (?, ?, ?)";
    return $this->db->execute($sql, [$code, $value, $validUntil]);
  }

  public function getAll(): array {
    return $this->db->select("SELECT * FROM vouchers ORDER BY id DESC");
  }

  public function delete(int $id): bool {
  return $this->db->execute("DELETE FROM vouchers WHERE id = ?", [$id]);
}

public function validateAndUse(string $code, float $total): ?array {
  $voucher = $this->db->getSingle("SELECT * FROM vouchers WHERE code = ? AND is_active = 1 AND is_used = 0", [$code]);

  if (!$voucher) return null;

  $discount = min($voucher['value'], $total);
  $newTotal = $total - $discount;

  $this->db->execute("UPDATE vouchers SET is_active = 0, is_used = 1 WHERE id = ?", [$voucher['id']]);

  return [
    'discount' => $discount,
    'new_total' => $newTotal,
    'message' => "Gutschein erfolgreich eingelöst.",
  ];
}


}
