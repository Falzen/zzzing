var gameStarted = false; // true à la fin du cowndown
let gameOver = false;
const urlParams = new URLSearchParams(window.location.search);
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
const inertia = 0.15; // Plus cette valeur est petite, plus l'inertie est grande
canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
});
let useSpeedForContraction = true; // Booléen pour basculer entre les modes de contraction
let mode = urlParams.has("mode") ? urlParams.get("mode") : "timed"; // Peut être "timed" ou "golden_death"
var score = 0;
let lives = 5;
const startingLives = lives;
let gameStartTime;
const gameDuration = 60000; // 1 minute en millisecondes pour le mode chronométré

let isMouseDown = false;
canvas.addEventListener('mousedown', () => {
    isMouseDown = true;
});
canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

let boule = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: 'green'
};

function resetGame() {
    score = 0;
    lives = 5;
    gameStartTime = Date.now();
    gameOver = false;
    createObstacles();
    updateTarget();
}

// Structure pour stocker les positions antérieures
let trail = [];
const trailLength = 10; // Longueur de la trainée

function updateTrail() {
    // Ajouter la position actuelle au début du tableau
    trail.unshift({x: boule.x, y: boule.y, opacity: 1});

    // Garder la longueur du tableau constante
    if (trail.length > trailLength) {
        trail.pop();
    }

    // Réduire progressivement l'opacité des éléments de la trainée
    trail.forEach((point, index) => {
        point.opacity = 1 - index / trailLength;
    });
}


















function drawTrail() {
    let trailSize = boule.radius / 1.3; // Définir la taille initiale de la trainée

    trail.forEach((point, index) => {
        ctx.beginPath();
        ctx.globalAlpha = (1 - index / trailLength) * 0.5; // Rendre plus transparent rapidement
        ctx.arc(point.x, point.y, trailSize * (1 - index / trailLength), 0, Math.PI * 2);
        ctx.fillStyle = boule.color; // Utiliser la couleur de la boule
        ctx.fill();
        ctx.closePath();
    });
    ctx.globalAlpha = 1; // Restaurer l'opacité pour les autres dessins
}


function drawBoule() {
    ctx.beginPath();
    // Appliquer la transparence si la boule est invincible
    ctx.globalAlpha = isInvincible() ? 0.5 : 1;
    // Changer la couleur de la boule si elle est invincible
    ctx.fillStyle = isInvincible() ? 'orange' : boule.color;
    let bouleColor = boule.color;
    const currentTime = Date.now();
    if (currentTime - lastCollisionTime < invincibilityDuration) {
        bouleColor = 'orange';
        ctx.globalAlpha = 0.5; // Rendre la boule transparente pendant l'invincibilité
    } else {
        ctx.globalAlpha = 1; // Opacité normale
    }
    const dx = mouseX - boule.x;
    const dy = mouseY - boule.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const maxSpeed = 50; // Augmenter pour réduire la déformation à vitesse élevée
    const contractionFactor = Math.min(speed / maxSpeed, 1); // Facteur de contraction
    if (useSpeedForContraction) {
        // Ajuster la taille de l'ellipse en fonction de la vitesse, avec une déformation plus subtile
        const angle = Math.atan2(dy, dx);
        const radiusX = boule.radius * (1 + contractionFactor * 0.3); // Légère augmentation de la longueur
        const radiusY = boule.radius * (1 - contractionFactor * 0.3); // Légère réduction de la largeur
        ctx.ellipse(boule.x, boule.y, radiusX, radiusY, angle, 0, Math.PI * 2);
    } else {
        // Dessiner la boule normale
        ctx.arc(boule.x, boule.y, boule.radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1; // Restaurer l'opacité pour les autres dessins

    updateTrail(); // Mettre à jour la trainée
}


function moveBoule() {
    // Calculer la différence entre la position actuelle de la boule et le curseur
    const dx = mouseX - boule.x;
    const dy = mouseY - boule.y;
    // Déplacer la boule vers le curseur avec inertie
    boule.x += dx * inertia;
    boule.y += dy * inertia;
}
let obstacles = [];
const startingObstacleCount = 10; // Nombre d'obstacles à générer
let targetIndex = Math.floor(Math.random() * startingObstacleCount); // Index de la cible originale
function createObstacles() {
    obstacles = []; // Réinitialiser les obstacles
    for (let i = 0; i < startingObstacleCount; i++) {
        let obstacle = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            width: 20,
            height: 20,
            color: i === targetIndex ? 'blue' : 'red', // La cible est bleue
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4
        };
        obstacles.push(obstacle);
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function moveObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x += obstacle.dx;
        obstacle.y += obstacle.dy;
        // Rebondir sur les bords du canvas
        if (obstacle.x < 0 || obstacle.x > canvas.width - obstacle.width) obstacle.dx *= -1;
        if (obstacle.y < 0 || obstacle.y > canvas.height - obstacle.height) obstacle.dy *= -1;
    });
}
createObstacles();
let lastCollisionTime = 0;
let lastInvincibilityTime = Date.now();
let countdown = 3; // Durée du compte à rebours en secondes
let countdownStartTime = Date.now();
const invincibilityDuration = 500; // Délai d'invincibilité en millisecondes
function checkCollision() {
    if (isInvincible()) {
        return false;
    }

    const currentTime = Date.now();
    if (currentTime - lastCollisionTime < invincibilityDuration) {
        return false;
    }

    const dx = mouseX - boule.x;
    const dy = mouseY - boule.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const maxSpeed = 50;
    const contractionFactor = Math.min(speed / maxSpeed, 1);

    // Calculer les rayons de l'ellipse
    let radiusX = boule.radius * (1 + contractionFactor * 0.3);
    let radiusY = boule.radius * (1 - contractionFactor * 0.3);

    for (let obstacle of obstacles) {
        if (ellipseRectCollision(boule.x, boule.y, radiusX, radiusY, obstacle)) {
            return true; // Collision détectée
        }
    }
    return false; // Pas de collision
}

function ellipseRectCollision(ellipseX, ellipseY, ellipseRX, ellipseRY, rect) {
    let deltaX = ellipseX - Math.max(rect.x, Math.min(ellipseX, rect.x + rect.width));
    let deltaY = ellipseY - Math.max(rect.y, Math.min(ellipseY, rect.y + rect.height));
    return (deltaX * deltaX) / (ellipseRX * ellipseRX) + (deltaY * deltaY) / (ellipseRY * ellipseRY) <= 1;
}

function checkCollisionWithTarget() {
    const target = obstacles[targetIndex];

    const dx = mouseX - boule.x;
    const dy = mouseY - boule.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const maxSpeed = 50;
    const contractionFactor = Math.min(speed / maxSpeed, 1);

    let radiusX = boule.radius * (1 + contractionFactor * 0.3);
    let radiusY = boule.radius * (1 - contractionFactor * 0.3);

    return ellipseRectCollision(boule.x, boule.y, radiusX, radiusY, target);
}


function spawnNewObstacles(nb) {
    // valeur par défaut
    if(!nb || isNaN(nb)) {
        nb = 2;
    }
    while (nb > 0) {
        let obstacle = {
            x: Math.random() * (canvas.width - 20) + 10, // S'assurer que l'obstacle reste dans le canvas
            y: Math.random() * (canvas.height - 20) + 10, // S'assurer que l'obstacle reste dans le canvas
            width: 20,
            height: 20,
            color: 'red',
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4
        };
        // S'assurer que le nouvel obstacle n'est pas trop proche du joueur
        if (Math.abs(obstacle.x - boule.x) > 50 && Math.abs(obstacle.y - boule.y) > 50) {
            obstacles.push(obstacle);
            nb--;
        }
    }
}

function updateTarget() {
    // Réinitialiser la couleur de l'ancienne cible
    // if (obstacles[targetIndex]) {
    //     obstacles[targetIndex].color = 'red';
    // }
    // Retirer l'ancienne cible
    if (obstacles[targetIndex]) {
        obstacles.splice(targetIndex, 1);
    }
    // Choisir un nouvel indice de cible aléatoire
    targetIndex = Math.floor(Math.random() * obstacles.length);
    // Mettre à jour la couleur de la nouvelle cible
    obstacles[targetIndex].color = 'blue';
}

function isInvincible() {
    return (
        Date.now() - lastInvincibilityTime < invincibilityDuration)
    || (Date.now() - countdownStartTime < countdown * 1000
    );
}

function drawCountdown() {
    if (isInvincible()) {
        ctx.font = '48px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
    }
}

function updateCountdown() {
    if (isInvincible() && Date.now() - countdownStartTime >= 1000) {
        countdown -= 1;
        if(countdown == 0) {
            gameStarted = true;
        }
        countdownStartTime = Date.now();
    }
}

function drawHearts() {
    let heartX = canvas.width / 2 - 50; // Position de départ pour les cœurs
    let heartY = canvas.height - 32; // Position en Y sous le canvas
    let heartSize = 16; // Taille du cœur
    ctx.fillStyle = 'red';
    for (let i = 0; i < 5; i++) {
        if (i < lives) {
            // Dessiner un cœur plein
            drawHeart(heartX + i * 25, heartY, heartSize);
        } else {
            // Dessiner un cœur vide
            drawHeart(heartX + i * 25, heartY, heartSize, true);
        }
    }
}

function drawHeart(x, y, size, empty = false) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    // Top left curve
    ctx.bezierCurveTo(
        x, y,
        x - size / 2, y,
        x - size / 2, y + topCurveHeight
    );
    // Bottom left curve
    ctx.bezierCurveTo(
        x - size / 2, y + (size + topCurveHeight) / 2,
        x, y + (size + topCurveHeight) / 2,
        x, y + size
    );
    // Bottom right curve
    ctx.bezierCurveTo(
        x, y + (size + topCurveHeight) / 2,
        x + size / 2, y + (size + topCurveHeight) / 2,
        x + size / 2, y + topCurveHeight
    );
    // Top right curve
    ctx.bezierCurveTo(
        x + size / 2, y,
        x, y,
        x, y + topCurveHeight
    );
    ctx.closePath();
    ctx.fillStyle = empty ? 'grey' : 'red';
    ctx.fill();
}

let flashActive = false;

function triggerCollisionFlash() {
    canvas.classList.add('is-negative');
    setTimeout(() => {
        canvas.classList.remove('is-negative');
    }, 250); // Durée du flash en millisecondes
}















function drawProgressBar() {
    let progressBarX = canvas.width / 2 - 100; // Position de départ pour la barre de progression
    let progressBarY = canvas.height - 15; // Position en Y pour la barre de progression
    let progressBarWidth = 200; // Largeur de la barre de progression
    let progressBarHeight = 10; // Hauteur de la barre de progression
    let timeElapsed = Date.now() - gameStartTime;
    // Dessiner la barre de fond grise
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    // Calculer la largeur de la barre de progression verte
    let greenBarWidth = (timeElapsed / gameDuration) * progressBarWidth;
    greenBarWidth = greenBarWidth > progressBarWidth ? progressBarWidth : greenBarWidth; // Limiter à la largeur maximale
    // Dessiner la barre de progression verte
    ctx.fillStyle = 'rgba(144, 238, 144, 0.5)';
    ctx.fillRect(progressBarX, progressBarY, greenBarWidth, progressBarHeight);
}

function drawScore() {
    let scoreX = canvas.width / 2 + 140; // Position en X à droite de la barre de progression
    let scoreY = canvas.height - 5; // Position en Y, alignée avec la barre de progression
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText("Score: " + score, scoreX, scoreY);
}

function update() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTrail(); // Dessiner la trainée avant la boule
        moveBoule();
        drawBoule();
        moveObstacles();
        drawObstacles();
        if (checkCollision()) {
            if (checkCollisionWithTarget()) {
                score++;
                console.log("Cible atteinte ! Score:", score);
                spawnNewObstacles(2); // Ajouter de nouveaux obstacles + cible
                updateTarget(); // détruit l'ancienne cible aussi
            }
            else {
                if (!isInvincible()) {
                    console.log("Collision détectée !");
                    lives--;
                    triggerCollisionFlash();
                    // vérifie le gameover seulement quand touché
                    if(mode == "golden_death") {
                        checkGameOver();    
                    }
                }
            }
            lastInvincibilityTime = Date.now();
        }
        // vérifie le gameover constamment
        if(mode == "timed") {
            checkGameOver();    
        }
        drawHearts(); // Dessiner les cœurs
        drawProgressBar(); // Dessiner la barre de progression
        drawScore(); // Afficher le score

        if(!gameStarted) {
            updateCountdown();
            drawCountdown();
        }

        requestAnimationFrame(update);
    }
    else {
        gameOver = true;
    }
}

function checkGameOver() {
    if (lives <= 0 || Date.now() - gameStartTime > gameDuration) {
        gameOver = true;
        let survived = lives > 0;
        let isPerfect = startingLives == lives;
        let placeholderPseudo = '';
        // Récupérer le pseudo depuis l'URL si existe
        if (urlParams.has('pseudo')) {
            placeholderPseudo = urlParams.get('pseudo');
        }
        // Afficher le score et demander le pseudo de l'utilisateur
        let userPseudo = prompt("Game Over! Score: " + score + "\nPseudo : ", placeholderPseudo);
        if (userPseudo != null && userPseudo.trim() !== "") {
            // Soumettre le score si un pseudo a été entré
            submitScore(userPseudo, score, lives, survived, isPerfect);
        } else {
            // Gérer le cas où aucun pseudo n'est fourni
            alert("Score pas enregistré: No pseudo provided.");
        }
    }
}

function submitScore(pseudo, score, remainingLives, survived, isPerfect) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            // Redirection avec le pseudo en paramètre
            window.location.href = window.location.pathname + '?pseudo=' + encodeURIComponent(pseudo);
        }
    };
    xhttp.open("POST", "insert_score.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("pseudo=" + pseudo + "&score=" + score + "&remaining_lives=" + remainingLives + "&survived=" + survived + "&is_perfect=" + isPerfect);
}
resetGame();
update();