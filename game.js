// الربط المباشر مع تليجرام لكسر الحاجة لأي روابط
const tg = window.Telegram ? window.Telegram.WebApp : null;

if (tg) {
    tg.ready();
    tg.expand();
}

const ball = document.getElementById('ball');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const leaderboardModal = document.getElementById('leaderboardModal');
const finalScoreDisplay = document.getElementById('finalScore');
const usernameDisplay = document.getElementById('username');
const leaderboardList = document.getElementById('leaderboardList');

// جلب بيانات اللاعب تلقائياً من التليجرام
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
        leaderboardModal.style.display = 'none';
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

// سيرفر تخزين تلقائي سحابي مباشر
const DB_URL = "https://football-game-leaderboard-default-rtdb.firebaseio.com/scores";

// حفظ النتيجة تلقائياً عند الخسارة
async function saveScoreToCloud(id, name, score) {
    try {
        await fetch(`${DB_URL}/${id}.json`, {
            method: 'PUT',
            body: JSON.stringify({ name: name, score: score, timestamp: Date.now() })
        });
    } catch (err) {}
}

// جلب أعلى 10 نتائج تلقائياً
async function fetchLeaderboardFromCloud() {
    leaderboardList.innerHTML = '<li>جاري التحميل... ⏳</li>';
    try {
        const res = await fetch(`${DB_URL}.json`);
        const data = await res.json();

        if (!data) {
            leaderboardList.innerHTML = '<li>لا يوجد لاعبين حتى الآن! ⚽️</li>';
            return;
        }

        let scoresArr = Object.values(data);
        scoresArr.sort((a, b) => b.score - a.score);

        leaderboardList.innerHTML = '';
        scoresArr.slice(0, 10).forEach((item, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            const li = document.createElement('li');
            li.innerHTML = `${medal} <b>${item.name}</b>: ${item.score} نقطة`;
            leaderboardList.appendChild(li);
        });
    } catch (err) {
        leaderboardList.innerHTML = '<li>تعذر تحميل القائمة ❌</li>';
    }
}

function openLeaderboard() {
    leaderboardModal.style.display = 'block';
    gameOverScreen.style.display = 'none';
    fetchLeaderboardFromCloud();
}

function closeLeaderboard() {
    leaderboardModal.style.display = 'none';
    gameOverScreen.style.display = 'block';
}

function endGame() {
    isPlaying = false;
    cancelAnimationFrame(gameLoop);
    finalScoreDisplay.textContent = score;
    
    // التخزين التلقائي المباشر بدون إرسال أي رابط
    if (highScore > 0) {
        saveScoreToCloud(userId, playerName, highScore);
    }
    
    gameOverScreen.style.display = 'block';
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
    leaderboardModal.style.display = 'none';
    isPlaying = false;
}

ball.addEventListener('touchstart', kickBall, { passive: false });
ball.addEventListener('mousedown', kickBall);

resetGame();
