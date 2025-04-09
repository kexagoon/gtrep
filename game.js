document.addEventListener('DOMContentLoaded', () => {
    const config = {
        baseSpeed: 2,           // Базовая скорость шариков
        baseSize: 50,           // Начальный размер шариков
        minSize: 25,            // Минимальный размер
        maxSize: 250,           // Максимальный размер
        sizeIncrease: 1.15,     // Увеличение размера при съедении смайлика
        speedIncrease: 1.15,    // Увеличение скорости при съедении смайлика
        speedDecrease: 0.95,    // Уменьшение скорости при столкновении
        stuckThreshold: 1000,   // Порог застревания (1 секунда)
        helpRadius: 100,        // Радиус помощи (пиксели)
        minSpeed: 0.1           // Минимальная скорость
    };

    // Создаём шарики
    const balls = [
        createBall('red-ball', 'red'),
        createBall('green-ball', 'green'),
        createBall('blue-ball', 'blue')
    ];

    let score = 0;
    const scoreDisplay = document.getElementById('score-display');
    let smiley = null;

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
            dx: Math.cos(angle) * config.baseSpeed,  // Начальная скорость по X
            dy: Math.sin(angle) * config.baseSpeed,  // Начальная скорость по Y
            size,
            speed: config.baseSpeed,
            previousX: null,
            previousY: null,
            stuckTime: 0  // Время застревания
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

        setTimeout(createSmiley, 20000);  // Новый смайлик через 20 секунд
    }

    // Проверка столкновений
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

        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                const ball1 = balls[i];
                const ball2 = balls[j];
                if (isBallsColliding(ball1, ball2)) {
                    handleBallCollision(ball1, ball2);
                }
            }
        }
    }

    // Столкновение шариков
    function handleBallCollision(ball1, ball2) {
        ball1.size = Math.max(ball1.size * 0.95, config.minSize);
        ball2.size = Math.max(ball2.size * 0.95, config.minSize);

        ball1.speed *= config.speedDecrease;
        ball2.speed *= config.speedDecrease;
        updateBallSpeed(ball1);
        updateBallSpeed(ball2);

        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / distance;
        const ny = dy / distance;
        const p = 2 * (ball1.dx * nx + ball1.dy * ny - ball2.dx * nx - ball2.dy * ny) /
                  (ball1.size + ball2.size);

        ball1.dx -= p * ball2.size * nx;
        ball1.dy -= p * ball2.size * ny;
        ball2.dx += p * ball1.size * nx;
        ball2.dy += p * ball1.size * ny;
    }

    // Обновление скорости шарика
    function updateBallSpeed(ball) {
        const currentSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        if (currentSpeed < config.minSpeed) {
            const angle = Math.random() * Math.PI * 2;
            ball.dx = Math.cos(angle) * config.minSpeed;
            ball.dy = Math.sin(angle) * config.minSpeed;
        } else {
            const ratio = ball.speed / currentSpeed;
            ball.dx *= ratio;
            ball.dy *= ratio;
        }
    }

    // Проверка пересечения прямоугольников
    function isColliding(rect1, rect2) {
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    }

    // Проверка столкновения шариков
    function isBallsColliding(ball1, ball2) {
        const dx = ball1.x + ball1.size / 2 - (ball2.x + ball2.size / 2);
        const dy = ball1.y + ball1.size / 2 - (ball2.y + ball2.size / 2);
        return Math.sqrt(dx * dx + dy * dy) < (ball1.size / 2 + ball2.size / 2);
    }

    // Помощь застрявшему шарику
    function helpStuckBall(stuckBall) {
        balls.forEach(ball => {
            if (ball !== stuckBall && ball.stuckTime === 0) {  // Только движущиеся шарики помогают
                const dx = stuckBall.x - ball.x;
                const dy = stuckBall.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < config.helpRadius) {
                    const helpForce = 0.1;  // Сила помощи
                    ball.dx += (dx / distance) * helpForce;
                    ball.dy += (dy / distance) * helpForce;
                }
            }
        });
    }

    // Игровой цикл
    let lastTime = performance.now();
    function gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;  // Время в секундах
        lastTime = currentTime;

        balls.forEach(ball => {
            // Сохраняем предыдущую позицию
            ball.previousX = ball.x;
            ball.previousY = ball.y;

            // Обновляем позицию
            ball.x += ball.dx * 60 * deltaTime;  // 60 — для нормализации скорости
            ball.y += ball.dy * 60 * deltaTime;

            // Отскок от стен
            if (ball.x < 0) {
                ball.x = 0;
                ball.dx = Math.abs(ball.dx);
            }
            if (ball.x > window.innerWidth - ball.size) {
                ball.x = window.innerWidth - ball.size;
                ball.dx = -Math.abs(ball.dx);
            }
            if (ball.y < 0) {
                ball.y = 0;
                ball.dy = Math.abs(ball.dy);
            }
            if (ball.y > window.innerHeight - ball.size) {
                ball.y = window.innerHeight - ball.size;
                ball.dy = -Math.abs(ball.dy);
            }

            // Обновляем стиль элемента
            ball.element.style.left = `${ball.x}px`;
            ball.element.style.top = `${ball.y}px`;
            ball.element.style.width = `${ball.size}px`;
            ball.element.style.height = `${ball.size}px`;

            // Проверка на застревание
            if (ball.x === ball.previousX && ball.y === ball.previousY) {
                ball.stuckTime += deltaTime * 1000;  // Переводим в миллисекунды
            } else {
                ball.stuckTime = 0;  // Сбрасываем время застревания
            }

            // Если шарик застрял, вызываем помощь
            if (ball.stuckTime > config.stuckThreshold) {
                console.log(`Шарик ${ball.color} застрял!`);
                helpStuckBall(ball);
            }
        });

        checkCollisions();
        requestAnimationFrame(gameLoop);
    }

    // Запуск игры
    createSmiley();
    gameLoop();
});