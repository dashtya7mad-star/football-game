// تهيئة Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}

const ball = document.getElementById('ball');
const container = document.getElementById('gameContainer');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');

let score = 0;
let highScore = localStorage.getItem('fb_high_score') || 0;
highScoreDisplay.textContent = highScore;

// متغيرة الحركة والفيزياء
let ballX = window.innerWidth / 2 - 35;
let ballY = window.innerHeight / 2;
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

    // الارتداد من الجوانب
    if (ballX <= 0 || ballX >= window.innerWidth - 70) {
        velocityX *= -0.8;
        ballX = Math.max(0, Math.min(ballX, window.innerWidth - 70));
    }

    // الخسارة عند ملامسة الأرض
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

    // رفع الكرة
    velocityY = -12;
    
    // انحراف الكرة يميناً أو يساراً حسب مكان النقر
    const touchX = e.touches ? e.touches[0].clientX : e.clientX;
    const ballCenter = ballX + 35;
    velocityX = (ballCenter - touchX) * -0.15;

    score++;
    scoreDisplay.textContent = score;

    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('fb_high_score', highScore);
    }
}

function endGame() {
    isPlaying = false;
    cancelAnimationFrame(gameLoop);
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
}

function resetGame() {
    score = 0;
    scoreDisplay.textContent = '0';
    ballX = window.innerWidth / 2 - 35;
    ballY = window.innerHeight / 2;
    velocityX = 0;
    velocityY = 0;
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    gameOverScreen.style.display = 'none';
    isPlaying = false;
}

// أحداث الضغط واللمس
ball.addEventListener('touchstart', kickBall, { passive: false });
ball.addEventListener('mousedown', kickBall);

// وضع الكرة المبدئي
resetGame();
