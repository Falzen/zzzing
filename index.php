<!DOCTYPE html>
<html>
<head>
    <title>zzzing!</title>
    <style>
        #pageContainer {
            display:  flex;
            flex-flow: row wrap;
            justify-content: stretch;
            align-items: flex-start;
        }
        #gameCanvas {
            border: 1px solid black;
            background-color: #f0f0f0;
            cursor: crosshair;
        }

        #scoresContainer {
            padding-left:  100px;
            flex-grow: 1;
        }
        table {
            width: 100%; /* Utiliser toute la largeur disponible */
            border-collapse: separate; /* Espacer les cellules */
            border-spacing: 0 10px; /* Espacer les lignes */
        }

        th, td {
            padding: 8px; /* Ajouter de l'espace autour du contenu de chaque cellule */
            text-align: left; /* Aligner le texte à gauche */
            border-bottom: 1px solid #ddd; /* Ajouter une ligne de séparation entre les lignes */
        }

        th {
            /*background-color: #f2f2f2;  Couleur de fond pour les en-têtes */
            border-top: 2px solid #ddd; /* Bordure en haut des en-têtes */
        }
        tbody tr:first-child {
            background-color: rgba(218, 165, 32, 0.5); /* Or doux avec une transparence de 50% */
          transition: all 0.2s ease;
        }
      tbody tr:first-child td:nth-child(2){
          position: relative;
      }
        tbody tr:first-child td:nth-child(2)::before {
              content: "👑";
            position: absolute;
            top: 0.3em;
            left: -1em;
            transform: rotate(0deg);
          transition: all 0.2s ease;
      }
        table:hover tbody tr:first-child td:nth-child(2)::before {
            top: -0.3em;
            left: -0.5em;
            transform: rotate(-35deg);
        }
        table:hover tbody tr:first-child  {
            box-shadow: 0 0 12px 1px gold;
      }
      
        tbody tr:nth-child(2) {
            background-color: rgba(192, 192, 192, 0.5); /* Gris argenté avec une transparence de 50% */
        }
        tbody tr:nth-child(3) {
            background-color: rgba(205, 127, 50, 0.5); /* Bronze avec une transparence de 50% */
        }
      
      /*
@keyframes scrollBackground {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: 50% 100%;
    }
}
        canvas {
            background-image: url('bg001.webp'); 
            background-repeat: repeat; 
            animation: scrollBackground 8s linear infinite;
 
      }
*/
      
      

      
        #knownIssuesContainer {
            flex-grow: 1;
        }
        .collapse-title {
            text-align: center;

        }
    </style>
</head>
<body>
    <div id="pageContainer">
        <canvas id="gameCanvas" width="1200" height="700"></canvas>
        <div id="scoresContainer">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Pseudo</th>
                        <th>Score</th>
                        <th>Survécu ?</th>
                    </tr>
                </thead>
                <tbody>
                <?php
                // Inclure le fichier de connexion (si ce n'est pas déjà fait)
                include 'connect.php';
                date_default_timezone_set('Europe/Paris');

                // Requête SELECT pour obtenir les scores
                $sql = "SELECT id, pseudo, score, created_date, remaining_lives, is_perfect FROM score ORDER BY score DESC";

                $result = $conn->query($sql);

                if ($result && $result->num_rows > 0) {
                    // Parcourir chaque enregistrement
                    while($row = $result->fetch_assoc()) {
                        $formattedDate = date('d-m-Y', $row["created_date"]);
                        $survivedCheckbox = $row['remaining_lives'] != 0 ? 'Yup' : 'Nope';

                        echo "<tr>
                                <td>{$formattedDate}</td>
                                <td>{$row['pseudo']}</td>
                                <td>{$row['score']}</td>
                                <td>{$survivedCheckbox}</td>
                              </tr>";
                    }
                } else {
                    echo "0 résultats";
                }

                $conn->close();
                ?>
                </tbody>
            </table>
        </div>
        
    </div>
        <!-- <div id="knownIssuesContainer">
            <p class="collapse-title"><a href="#" onclick="event.preventDefault();">↓&nbsp;&nbsp;Known issues&nbsp;&nbsp;↓</a></p> 
            <div class="collapse-details">
                <ul>
                    <li>Si pas de cible visible, bien regarder le long du bas et du mur de droite.</li>
                    <li>Meilleur effet visuel quand on se fait toucher</li>
                </ul>
            </div>  
            <script>
                document.addEventListener('.collapse-title').click(function() {   $('.collapse-details').toggle(); })  
            </script>
        </div> -->
    <script src="main.js"></script>
    <!-- <script>
        // Sélectionner l'élément avec la classe 'collapse-title'
        var collapseTitle = document.querySelector('.collapse-title');

        // Ajouter un écouteur d'événements pour le clic
        collapseTitle.addEventListener('click', function() {
            // Sélectionner l'élément avec la classe 'collapse-details'
            var collapseDetails = document.querySelector('.collapse-details');

            // Basculer la visibilité de l'élément
            if (collapseDetails.style.display === "none") {
                collapseDetails.style.display = "block";
            } else {
                collapseDetails.style.display = "none";
            }
        });
        collapseTitle.click();

    </script> -->
</body>
</html>
