<?php
// Paramètres de connexion à la base de données

$servername = "localhost";
$username = "root";
$password = "Cendrier&Hippopotame255";
$dbname = "zzzing_scores";


// Création de la connexion
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérification de la connexion
if ($conn->connect_error) {
    die("La connexion à la base de données a échoué : " . $conn->connect_error);
}

// Si tout va bien, la connexion est stockée dans $conn
?>
<!-- 
--
-- Table structure for table `score`
--

DROP TABLE IF EXISTS `score`;
CREATE TABLE IF NOT EXISTS `score` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pseudo` varchar(255) NOT NULL,
  `score` int NOT NULL,
  `created_date` int NOT NULL,
  `remaining_lives` int NOT NULL,
  `is_perfect` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) 
-->