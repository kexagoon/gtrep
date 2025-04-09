document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация игры
    const config = {
        baseSpeed: 2,
        baseSize: 50,
        minSize: 25,
        maxSize: 250,
        maxSpeed: 10, // Ограничение максимальной скорости
        sizeIncrease: 1.15,
        speedIncrease: 1.15,
        particleLife: 1000,
        particleSizeMin: 5,
        particleSizeMax: 15,
        particleOpacityMin: 0.3,
        particleOpacityMax: 0.8,
        sizeThreshold: 150 // 300% от baseSize (50 * 3)
    };

    // Массив шариков
    let balls = [
        createBall('red-ball', 'red'),
        createBall('green-ball', 'green'),
        createBall('blue-ball', 'blue')
    ];

    let score = 0;
    const scoreDisplay = document.getElementById('score-display');
    let smiley = null;

    // Создание шарика
    function createBall(id, color) {
        const element = id ? document.getElementById(id) : document.createElement('div');
        if (!id) {
            element.className = 'ball';
            document.body.appendChild(element);
        }
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

    // Создание частицы
    function createParticle(x, y, color) {
        const size = Math.random() * (config.particleSizeMax - config.particleSizeMin) + config.particleSizeMin;
        const opacity = Math.random() * (config.particleOpacityMax - config.particleOpacityMin) + config.particleOpacityMin;
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x - size / 2}px`;
        particle.style.top = `${y - size / 2}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = `radial-gradient(circle, ${color}, transparent)`;
        particle.style.opacity = opacity;
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.style.transition = 'opacity 1s';
            particle.style.opacity = '0';
            setTimeout(() => particle.remove(), 1000);
        }, config.particleLife);
    }

    // Обновление скорости с ограничением
    function updateBallSpeed(ball) {
        const angle = Math.atan2(ball.dy, ball.dx);
        ball.speed = Math.min(ball.speed, config.maxSpeed); // Ограничиваем скорость
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
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

    // Проверка столкновения шариков
    function isBallsColliding(ball1, ball2) {
        const dx = ball1.x + ball1.size / 2 - (ball2.x + ball2.size / 2);
        const dy = ball1.y + ball1.size / 2 - (ball2.y + ball2.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (ball1.size / 2 + ball2.size / 2);
    }

    // Обработка столкновения шариков (отскок)
    function handleBallCollision(ball1, ball2) {
        const tempDx = ball1.dx;
        const tempDy = ball1.dy;
        ball1.dx = ball2.dx;
        ball1.dy = ball2.dy;
        ball2.dx = tempDx;
        ball2.dy = tempDy;
    }

    // Проверка размера и сброс
    function checkBallSize(ball) {
        if (ball.size >= config.sizeThreshold) { // 300% от начального размера
            ball.size = config.baseSize;
            ball.speed = config.baseSpeed;
            updateBallSpeed(ball);

            const newBall = createBall(null, ball.color);
            balls.push(newBall);
        }
    }

    // Проверка всех столкновений
    function checkCollisions() {
        // Столкновение со смайликом
        if (smiley) {
            const smileyRect = smiley.getBoundingClientRect();
            balls.forEach(ball => {
                const ballRect = ball.element.getBoundingClientRect();
                if (
                    ballRect.left < smileyRect.right &&
                    ballRect.right > smileyRect.left &&
                    ballRect.top < smileyRect.bottom &&
                    ballRect.bottom > smileyRect.top
                ) {
                    handleSmileyCollision(ball);
                }
            });
        }

        // Столкновение шариков друг с другом
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                if (isBallsColliding(balls[i], balls[j])) {
                    handleBallCollision(balls[i], balls[j]);
                }
            }
        }
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

            // Отскок от краёв
            if (ball.x < 0) { ball.x = 0; ball.dx = Math.abs(ball.dx); }
            if (ball.x > window.innerWidth - ball.size) { ball.x = window.innerWidth - ball.size; ball.dx = -Math.abs(ball.dx); }
            if (ball.y < 0) { ball.y = 0; ball.dy = Math.abs(ball.dy); }
            if (ball.y > window.innerHeight - ball.size) { ball.y = window.innerHeight - ball.size; ball.dy = -Math.abs(ball.dy); }

            ball.element.style.left = `${ball.x}px`;
            ball.element.style.top = `${ball.y}px`;
            ball.element.style.width = `${ball.size}px`;
            ball.element.style.height = `${ball.size}px`;

            createParticle(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.color);
            checkBallSize(ball);
        });

        checkCollisions();
        requestAnimationFrame(gameLoop);
    }

    // Запуск игры
    createSmiley();
    gameLoop();
});