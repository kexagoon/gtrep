document.addEventListener('DOMContentLoaded', () => {
    const config = {
        baseSpeed: 2,
        baseSize: 50,
        minSize: 25,
        maxSize: 250,
        sizeIncrease: 1.15,
        speedIncrease: 1.15,
        particleLife: 1000, // Время жизни частицы в миллисекундах
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

    // Создание красивой частицы
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

        // Анимация исчезновения
        setTimeout(() => {
            particle.style.transition = 'opacity 1s';
            particle.style.opacity = '0';
            setTimeout(() => particle.remove(), 1000);
        }, config.particleLife);
    }

    // Обновление скорости шарика
    function updateBallSpeed(ball) {
        const angle = Math.atan2(ball.dy, ball.dx);
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
    }

    // Проверка столкновений
    function checkCollisions() {
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

            // Отскок от краев
            if (ball.x < 0) { ball.x = 0; ball.dx = Math.abs(ball.dx); }
            if (ball.x > window.innerWidth - ball.size) { ball.x = window.innerWidth - ball.size; ball.dx = -Math.abs(ball.dx); }
            if (ball.y < 0) { ball.y = 0; ball.dy = Math.abs(ball.dy); }
            if (ball.y > window.innerHeight - ball.size) { ball.y = window.innerHeight - ball.size; ball.dy = -Math.abs(ball.dy); }

            ball.element.style.left = `${ball.x}px`;
            ball.element.style.top = `${ball.y}px`;
            ball.element.style.width = `${ball.size}px`;
            ball.element.style.height = `${ball.size}px`;

            // Создание частицы в каждом кадре
            createParticle(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.color);
        });

        checkCollisions();
        requestAnimationFrame(gameLoop);
    }

    // Запуск игры
    createSmiley();
    gameLoop();
});