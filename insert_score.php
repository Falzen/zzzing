<?php
include 'connect.php';

// Récupérer les données depuis la requête AJAX
$pseudo = $_POST['pseudo'];
$score = $_POST['score'];
$created_date = time(); // Timestamp actuel
$remaining_lives = $_POST['remaining_lives'];
$is_perfect = $_POST['is_perfect'];

// Requête INSERT
$sql = "INSERT INTO score (pseudo, score, created_date, remaining_lives, is_perfect) VALUES ('$pseudo', '$score', '$created_date', '$remaining_lives', '$is_perfect')";

if ($conn->query($sql) === TRUE) {
    echo "Nouveau score enregistré avec succès";
} else {
    echo "Erreur : " . $conn->error;
}

$conn->close();
?>
