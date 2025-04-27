<?php
require_once("config/db-access.php");

$dbAccess = new DBAccess();

// Beispiel: Einen neuen Benutzer einfügen
$newUser = [
    'salutation' => 'Herr',
    'firstname' => 'Max',
    'lastname' => 'Mustermann',
    'address' => 'Musterstraße 1',
    'zip' => '12345',
    'city' => 'Musterstadt',
    'email' => 'max@example.com',
    'username' => 'maxmuster',
    'password_hash' => password_hash('geheim', PASSWORD_DEFAULT),
    'payment_info' => 'VISA 1234',
    'is_admin' => false,
    'is_active' => true
];
$dbAccess->insert('users', $newUser);

// Beispiel: Benutzer mit bestimmtem Benutzernamen abrufen
$users = $dbAccess->select('users', ['username' => 'maxmuster']);
print_r($users);

// Beispiel: Benutzer aktualisieren
$updateData = ['city' => 'Neue Stadt'];
$conditions = ['username' => 'maxmuster'];
$dbAccess->update('users', $updateData, $conditions);

// Beispiel: Benutzer löschen
$dbAccess->delete('users', ['username' => 'maxmuster']);
?>
