// تهيئة تليجرام WebApp
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

// جلب وتحديد هوية المستخدم
let playerName = "لاعب";
let userId = "user_" + Math.floor(Math.random() * 1000000);

if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    playerName = tg.initDataUnsafe.user.first_name || "لاعب";
    userId = tg.initDataUnsafe.user.id ? String(tg.initDataUnsafe.user.id) : userId;
}
usernameDisplay.textContent = playerName;

let score = 0;
let highScore = parseInt(localStorage.getItem('fb_high_score_' + userId)) || 0;
highScoreDisplay.textContent = highScore;

// الفيزياء والأبعاد
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

window.addEventListener('resize', () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
});

let ballX = screenWidth / 2 - 35;
let ballY = screenHeight / 3;
let velocityX = 0;
let velocityY = 0;
const gravity = 0.45;
let isPlaying = false;
let gameLoop = null;

function updatePosition() {
    if (!isPlaying) return;

    velocityY += gravity;
    ballX += velocityX;
    ballY += velocityY;

    // الارتداد الجانبي
    if (ballX <= 0) {
        ballX = 0;
        velocityX *= -0.7;
    } else if (ballX >= screenWidth - 70) {
        ballX = screenWidth - 70;
        velocityX *= -0.7;
    }

    // انتهاء الجولة عند ملامسة الأرض
    if (ballY >= screenHeight - 80) {
        endGame();
        return;
    }

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

    gameLoop = requestAnimationFrame(updatePosition);
}

function kickBall(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (!isPlaying) {
        isPlaying = true;
        gameOverScreen.style.display = 'none';
        leaderboardModal.style.display = 'none';
        if (gameLoop) cancelAnimationFrame(gameLoop);
        gameLoop = requestAnimationFrame(updatePosition);
    }

    velocityY = -12;

    // تحديد مكان اللمس للفيزياء
    let touchX = ballX + 35;
    if (e.touches && e.touches.length > 0) {
        touchX = e.touches[0].clientX;
    } else if (e.clientX !== undefined) {
        touchX = e.clientX;
    }

    const ballCenter = ballX + 35;
    velocityX = (touchX - ballCenter) * -0.22;

    score++;
    scoreDisplay.textContent = score;

    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('fb_high_score_' + userId, highScore);
    }
}

// السيرفر السحابي لحفظ النتائج لجميع اللاعبين
const DB_URL = "https://football-game-leaderboard-default-rtdb.firebaseio.com/scores";

async function saveScoreToCloud(id, name, score) {
    try {
        await fetch(`${DB_URL}/${id}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, score: score, updated: Date.now() })
        });
    } catch (err) {
        console.error("Cloud Save Error:", err);
    }
}

async function fetchLeaderboardFromCloud() {
    leaderboardList.innerHTML = '<li>جاري التحميل... ⏳</li>';
    try {
        const res = await fetch(`${DB_URL}.json`);
        const data = await res.json();

        if (!data) {
            leaderboardList.innerHTML = '<li>لا يوجد نتائج حتى الآن! ⚽️</li>';
            return;
        }

        let scoresArr = Object.values(data);
        scoresArr.sort((a, b) => b.score - a.score);

        leaderboardList.innerHTML = '';
        scoresArr.slice(0, 10).forEach((item, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            const li = document.createElement('li');
            li.innerHTML = `<span>${medal} <b>${item.name}</b></span><span><b>${item.score}</b> نقطة</span>`;
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
    if (gameLoop) cancelAnimationFrame(gameLoop);
    
    finalScoreDisplay.textContent = score;
    
    if (highScore > 0) {
        saveScoreToCloud(userId, playerName, highScore);
    }
    
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
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    
    ballX = screenWidth / 2 - 35;
    ballY = screenHeight / 3;
    velocityX = 0;
    velocityY = 0;
    
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    
    gameOverScreen.style.display = 'none';
    leaderboardModal.style.display = 'none';
    isPlaying = false;
}

// الأحداث لتحريك الكرة بحساسية أعلى
ball.addEventListener('touchstart', kickBall, { passive: false });
ball.addEventListener('mousedown', kickBall);

resetGame();
