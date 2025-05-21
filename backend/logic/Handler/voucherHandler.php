<?php
require_once __DIR__ . '/../../models/voucher.class.php';

class voucherHandler {
  private $model;

  public function __construct() {
    $this->model = new Voucher();
  }

  public function handle(string $action, array $input): array {
    switch ($action) {
      case 'createVoucher':
        return $this->createVoucher($input);
      case 'listVouchers':
        return $this->listVouchers();
      case 'deleteVoucher':
        return $this->deleteVoucher($input);
      case 'validateVoucher':
        return $this->validateVoucher($input);


      default:
        return ['success' => false, 'error' => "Unbekannte Aktion: $action"];
    }
  }

  private function createVoucher(array $input): array {
    $code = trim($input['code'] ?? '');
    $value = (float)($input['value'] ?? 0);
    $validUntil = $input['valid_until'] ?? null;

    if (!$code || $value <= 0) {
      return ['success' => false, 'error' => 'Code und Wert sind erforderlich.'];
    }

    $success = $this->model->create($code, $value, $validUntil);
    return $success
      ? ['success' => true, 'message' => 'Gutschein erfolgreich erstellt.']
      : ['success' => false, 'error' => 'Fehler beim Speichern des Gutscheins.'];
  }

  private function listVouchers(): array {
    $vouchers = $this->model->getAll();
    return ['success' => true, 'vouchers' => $vouchers];
  }

  private function deleteVoucher(array $input): array {
  $id = (int)($input['id'] ?? 0);
  if ($id <= 0) {
    return ['success' => false, 'error' => 'Ungültige Gutschein-ID.'];
  }

  $success = $this->model->delete($id);
  return $success
    ? ['success' => true, 'message' => 'Gutschein gelöscht.']
    : ['success' => false, 'error' => 'Fehler beim Löschen.'];
}

private function validateVoucher(array $input): array {
    $code = trim($input['code'] ?? '');
    $total = (float)($input['total'] ?? 0);

    if (!$code || $total <= 0) {
      return ['success' => false, 'error' => 'Code oder Betrag fehlt.'];
    }

    $result = $this->model->validateAndUse($code, $total);

    return $result
      ? ['success' => true] + $result
      : ['success' => false, 'error' => 'Gutschein ungültig oder bereits verwendet.'];
  }


}
