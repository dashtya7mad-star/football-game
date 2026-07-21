// الربط مع Telegram WebApp
const tg = window.Telegram ? window.Telegram.WebApp : null;

if (tg) {
    tg.ready();
    tg.expand();
}

const ball = document.getElementById('ball');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const usernameDisplay = document.getElementById('username');

// جلب اسم وحساب المستخدم
let playerName = "لاعب";
let userId = "user_" + Math.floor(Math.random() * 100000);

if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    playerName = tg.initDataUnsafe.user.first_name || "لاعب";
    userId = tg.initDataUnsafe.user.id || userId;
}
usernameDisplay.textContent = playerName;

let score = 0;
let highScore = localStorage.getItem('fb_high_score_' + userId) || 0;
highScoreDisplay.textContent = highScore;

// فيزياء حركة الكرة
let ballX = window.innerWidth / 2 - 35;
let ballY = window.innerHeight / 3;
let velocityX = 0;
let velocityY = 0;
const gravity = 0.45;
let isPlaying = false;
let gameLoop;

function updatePosition() {
    if (!isPlaying) return;

    velocityY += gravity;
    ballX += velocityX;
    ballY += velocityY;

    if (ballX <= 0 || ballX >= window.innerWidth - 70) {
        velocityX *= -0.8;
        ballX = Math.max(0, Math.min(ballX, window.innerWidth - 70));
    }

    if (ballY >= window.innerHeight - 80) {
        endGame();
        return;
    }

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

    gameLoop = requestAnimationFrame(updatePosition);
}

function kickBall(e) {
    e.preventDefault();

    if (!isPlaying) {
        isPlaying = true;
        gameOverScreen.style.display = 'none';
        gameLoop = requestAnimationFrame(updatePosition);
    }

    velocityY = -12;
    const touchX = e.touches ? e.touches[0].clientX : e.clientX;
    const ballCenter = ballX + 35;
    
    velocityX = (touchX - ballCenter) * -0.25;

    score++;
    scoreDisplay.textContent = score;

    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('fb_high_score_' + userId, highScore);
    }
}

function endGame() {
    isPlaying = false;
    cancelAnimationFrame(gameLoop);
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
}

function shareScore() {
    const shareText = `لقد سجلت ${score} نقطة في لعبة كرة القدم! ⚽️ هل يمكنك التغلب علي؟`;
    if (tg) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me/KurdshFootball_bot')}&text=${encodeURIComponent(shareText)}`);
    }
}

function resetGame() {
    score = 0;
    scoreDisplay.textContent = '0';
    ballX = window.innerWidth / 2 - 35;
    ballY = window.innerHeight / 3;
    velocityX = 0;
    velocityY = 0;
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    gameOverScreen.style.display = 'none';
    isPlaying = false;
}

ball.addEventListener('touchstart', kickBall, { passive: false });
ball.addEventListener('mousedown', kickBall);

resetGame();
