<?php
require_once("../config/dbaccess.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $db = dbaccess::getInstance();

    $sql = "INSERT INTO users (salutation, firstname, lastname, address, zip, city, email, username, password_hash, payment_info, is_admin, is_active)
            VALUES (:salutation, :firstname, :lastname, :address, :zip, :city, :email, :username, :password_hash, :payment_info, :is_admin, :is_active)";

    $params = [
        ':salutation' => $_POST['salutation'],
        ':firstname' => $_POST['firstname'],
        ':lastname' => $_POST['lastname'],
        ':address' => $_POST['address'],
        ':zip' => $_POST['zip'],
        ':city' => $_POST['city'],
        ':email' => $_POST['email'],
        ':username' => $_POST['username'],
        ':password_hash' => password_hash($_POST['password'], PASSWORD_DEFAULT),
        ':payment_info' => $_POST['payment_info'] ?? '',
        ':is_admin' => 0,
        ':is_active' => 1
    ];

    $success = $db->execute($sql, $params);

    echo $success ? "✅ Registrierung erfolgreich!" : "❌ Registrierung fehlgeschlagen.";
}
?>
