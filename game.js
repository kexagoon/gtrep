document.addEventListener('DOMContentLoaded', () => {
    const config = {
        baseSpeed: 2,
        baseSize: 50,
        minSize: 25,
        maxSize: 250,
        sizeIncrease: 1.15,
        speedIncrease: 1.15,
        speedDecrease: 0.95,
        particleLife: 1000,
        smileySpawnDelay: 20000,
        stuckThreshold: 1000,
        helpRadius: 100
    };

    const balls = [
        createBall('red-ball', 'red'),
        createBall('green-ball', 'green'),
        createBall('blue-ball', 'blue')
    ];
    
    let smiley = null;
    let score = 0;
    const particles = [];
    const scoreDisplay = document.getElementById('score-display');

    function createBall(id, color) {
        const element = document.getElementById(id);
        const size = config.baseSize;
        const angle = Math.random() * Math.PI * 2;
        
        element.style.backgroundColor = color;
        element.style.boxShadow = `0 0 15px ${color}`;
        
        return {
            element,
            color,
            x: Math.random() * (window.innerWidth - size),
            y: Math.random() * (window.innerHeight - size),
            dx: Math.cos(angle) * config.baseSpeed,
            dy: Math.sin(angle) * config.baseSpeed,
            size,
            speed: config.baseSpeed,
            lastX: null,
            lastY: null,
            stuckTime: 0
        };
    }

    function createSmiley() {
        if (smiley) return; // Не создавать, если смайлик уже есть
        
        const smileys = ['😀', '😎', '🤩', '😍', '🥳', '🤪'];
        smiley = document.createElement('div');
        smiley.className = 'smiley';
        smiley.textContent = smileys[Math.floor(Math.random() * smileys.length)];
        smiley.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
        smiley.style.top = `${Math.random() * (window.innerHeight - 50)}px`;
        document.body.appendChild(smiley);
    }

    function handleSmileyCollision(ball) {
        smiley.remove();
        smiley = null;
        ball.size = Math.min(ball.size * config.sizeIncrease, config.maxSize);
        ball.speed *= config.speedIncrease;
        updateBallSpeed(ball);
        score++;
        scoreDisplay.textContent = `Смайлики: ${score}`;
        
        // Мигание шарика
        ball.element.classList.add('flashing');
        setTimeout(() => {
            ball.element.classList.remove('flashing');
        }, 5000);
        
        // Новый смайлик через 20 секунд
        setTimeout(createSmiley, config.smileySpawnDelay);
    }

    // Остальной код остаётся без изменений, добавлю только ключевые части
    function checkCollisions() {
        if (smiley) {
            const smileyRect = smiley.getBoundingClientRect();
            balls.forEach(ball => {
                const ballRect = ball.element.getBoundingClientRect();
                if (isColliding(ballRect, smileyRect)) {
                    handleSmileyCollision(ball);
                }
            });
        }
        // Проверка столкновений между шариками остаётся без изменений
    }

    function gameLoop() {
        // Игровой цикл остаётся без изменений
        checkCollisions();
        requestAnimationFrame(gameLoop);
    }

    createSmiley();
    gameLoop();
});

// Здесь опущены остальные функции для краткости, они остаются как в исходном коде