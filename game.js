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
const leaderboardList = document.getElementById('leaderboardList');

// جلب اسم المستخدم من تليجرام
let playerName = "لاعب";
if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    playerName = tg.initDataUnsafe.user.first_name || "لاعب";
}
usernameDisplay.textContent = playerName;

let score = 0;
let highScore = localStorage.getItem('fb_high_score_' + playerName) || 0;
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

    // الارتداد من الحواف
    if (ballX <= 0 || ballX >= window.innerWidth - 70) {
        velocityX *= -0.8;
        ballX = Math.max(0, Math.min(ballX, window.innerWidth - 70));
    }

    // الخسارة عند سقوط الكرة للأرض
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
    velocityX = (ballCenter - touchX) * -0.15;

    score++;
    scoreDisplay.textContent = score;

    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('fb_high_score_' + playerName, highScore);
        saveScoreToLeaderboard(playerName, highScore);
    }
}

// حفظ النتيجة في القائمة المحترفة
function saveScoreToLeaderboard(name, score) {
    let scores = JSON.parse(localStorage.getItem('global_scores') || '[]');
    const existingPlayerIndex = scores.findIndex(item => item.name === name);

    if (existingPlayerIndex !== -1) {
        if (score > scores[existingPlayerIndex].score) {
            scores[existingPlayerIndex].score = score;
        }
    } else {
        scores.push({ name: name, score: score });
    }

    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('global_scores', JSON.stringify(scores));
}

// تحديث عرض قائمة الترتيب
function updateLeaderboardUI() {
    let scores = JSON.parse(localStorage.getItem('global_scores') || '[]');
    leaderboardList.innerHTML = '';

    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li>كن أول من يسجل نقطة! ⚽️</li>';
        return;
    }

    scores.slice(0, 10).forEach((item, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        const li = document.createElement('li');
        li.innerHTML = `${medal} <b>${item.name}</b>: ${item.score} نقطة`;
        leaderboardList.appendChild(li);
    });
}

function endGame() {
    isPlaying = false;
    cancelAnimationFrame(gameLoop);
    finalScoreDisplay.textContent = score;
    saveScoreToLeaderboard(playerName, highScore);
    updateLeaderboardUI();
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
