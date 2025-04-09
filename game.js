document.addEventListener('DOMContentLoaded', () => {
    const config = {
        baseSpeed: 2,
        baseSize: 50,
        minSize: 25,
        maxSize: 250,
        sizeIncrease: 1.15,
        speedIncrease: 1.15,
        particleSizeMin: 5,
        particleSizeMax: 15,
        particleOpacityMin: 0.3,
        particleOpacityMax: 0.8
    };

    const balls = [
        createBall('red-ball', 'red'),
        createBall('green-ball', 'green'),
        createBall('blue-ball', 'blue')
    ];

    let score = 0;
    const scoreDisplay = document.getElementById('score-display');
    let smiley = null;
    const obstacles = document.querySelectorAll('.obstacle');

    // Создание шарика
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
            speed: config.baseSpeed
        };
    }

    // Создание смайлика
    function createSmiley() {
        if (smiley) return;
        const smileys = ['😀', '😎', '🤩', '😍', '🥳', '🤪'];
        smiley = document.createElement('div');
        smiley.className = 'smiley';
        smiley.textContent = smileys[Math.floor(Math.random() * smileys.length)];
        smiley.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
        smiley.style.top = `${Math.random() * (window.innerHeight - 50)}px`;
        document.body.appendChild(smiley);
    }

    // Обработка столкновения со смайликом
    function handleSmileyCollision(ball) {
        smiley.remove();
        smiley = null;
        ball.size = Math.min(ball.size * config.sizeIncrease, config.maxSize);
        ball.speed *= config.speedIncrease;
        updateBallSpeed(ball);
        score++;
        scoreDisplay.textContent = `Смайлики: ${score}`;

        ball.element.classList.add('flashing');
        setTimeout(() => ball.element.classList.remove('flashing'), 5000);

        setTimeout(createSmiley, 20000);
    }

    // Создание частицы
    function createParticle(x, y, color) {
        const size = Math.random() * (config.particleSizeMax - config.particleSizeMin) + config.particleSizeMin;
        const opacity = Math.random() * (config.particleOpacityMax - config.particleOpacityMin) + config.particleOpacityMin;
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${x - size / 2}px;
            top: ${y - size / 2}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            opacity: ${opacity};
            border-radius: 50%;
        `;
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }

    // Проверка столкновения с препятствиями
    function checkObstacleCollision(ball) {
        obstacles.forEach(obstacle => {
            const rect = obstacle.getBoundingClientRect();
            const ballRect = ball.element.getBoundingClientRect();

            if (
                ballRect.left < rect.right &&
                ballRect.right > rect.left &&
                ballRect.top < rect.bottom &&
                ballRect.bottom > rect.top
            ) {
                if (ballRect.left < rect.right && ball.dx < 0) ball.dx = Math.abs(ball.dx);
                if (ballRect.right > rect.left && ball.dx > 0) ball.dx = -Math.abs(ball.dx);
                if (ballRect.top < rect.bottom && ball.dy < 0) ball.dy = Math.abs(ball.dy);
                if (ballRect.bottom > rect.top && ball.dy > 0) ball.dy = -Math.abs(ball.dy);
            }
        });
    }

    // Обновление скорости шарика
    function updateBallSpeed(ball) {
        const angle = Math.atan2(ball.dy, ball.dx);
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
    }

    // Игровой цикл
    let lastTime = performance.now();
    function gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        balls.forEach(ball => {
            ball.x += ball.dx * 60 * deltaTime;
            ball.y += ball.dy * 60 * deltaTime;

            // Отскок от стен
            if (ball.x < 0) { ball.x = 0; ball.dx = Math.abs(ball.dx); }
            if (ball.x > window.innerWidth - ball.size) { ball.x = window.innerWidth - ball.size; ball.dx = -Math.abs(ball.dx); }
            if (ball.y < 0) { ball.y = 0; ball.dy = Math.abs(ball.dy); }
            if (ball.y > window.innerHeight - ball.size) { ball.y = window.innerHeight - ball.size; ball.dy = -Math.abs(ball.dy); }

            ball.element.style.left = `${ball.x}px`;
            ball.element.style.top = `${ball.y}px`;
            ball.element.style.width = `${ball.size}px`;
            ball.element.style.height = `${ball.size}px`;

            // Создание частиц в каждом кадре
            createParticle(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.color);

            // Проверка столкновения с препятствиями
            checkObstacleCollision(ball);

            // Проверка столкновения со смайликом
            if (smiley) {
                const smileyRect = smiley.getBoundingClientRect();
                const ballRect = ball.element.getBoundingClientRect();
                if (
                    ballRect.left < smileyRect.right &&
                    ballRect.right > smileyRect.left &&
                    ballRect.top < smileyRect.bottom &&
                    ballRect.bottom > smileyRect.top
                ) {
                    handleSmileyCollision(ball);
                }
            }
        });

        requestAnimationFrame(gameLoop);
    }

    // Запуск игры
    createSmiley();
    gameLoop();
});