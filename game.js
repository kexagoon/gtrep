document.addEventListener('DOMContentLoaded', () => {
    const config = {
        baseSpeed: 2,
        baseSize: 50,
        minSize: 25,
        maxSize: 250,
        maxSpeed: 10,
        minSpeed: 0.5,
        sizeIncrease: 1.15,
        speedIncrease: 1.15,
        particleLife: 1000,
        particleSizeMin: 5,
        particleSizeMax: 15,
        particleOpacityMin: 0.3,
        particleOpacityMax: 0.8,
        sizeThreshold: 150,
        stuckTimeThreshold: 3000,
        maxBalls: 20,
        restitution: 0.6, // Мягкость для "космического" эффекта
        speedReductionTime: 3000 // 3 секунды для временного замедления
    };

    let balls = [
        createBall('red-ball', 'red'),
        createBall('green-ball', 'green'),
        createBall('blue-ball', 'blue')
    ];

    let score = 0;
    const scoreDisplay = document.getElementById('score-display');
    let smiley = null;

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
        element.style.transition = 'width 0.2s, height 0.2s';

        return {
            element,
            color,
            x: Math.random() * (window.innerWidth - size),
            y: Math.random() * (window.innerHeight - size),
            dx: Math.cos(angle) * config.baseSpeed,
            dy: Math.sin(angle) * config.baseSpeed,
            size,
            speed: config.baseSpeed,
            baseSpeed: config.baseSpeed, // Исходная скорость
            stuckTime: 0,
            mass: size,
            speedReductionEnd: 0 // Время окончания замедления
        };
    }

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

    function updateBallSpeed(ball, currentTime) {
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (currentTime && ball.speedReductionEnd > currentTime) {
            ball.speed = Math.max(currentSpeed * 0.5, config.minSpeed); // Замедление на 50%
        } else {
            ball.speed = Math.max(ball.baseSpeed, currentSpeed); // Восстановление базовой скорости
            ball.speedReductionEnd = 0;
        }

        if (currentSpeed < config.minSpeed || isNaN(currentSpeed)) {
            const angle = Math.random() * Math.PI * 2;
            ball.speed = config.minSpeed;
            ball.dx = Math.cos(angle) * ball.speed;
            ball.dy = Math.sin(angle) * ball.speed;
        } else {
            ball.speed = Math.min(ball.speed, config.maxSpeed);
            const angle = Math.atan2(ball.dy, ball.dx);
            ball.dx = Math.cos(angle) * ball.speed;
            ball.dy = Math.sin(angle) * ball.speed;
        }
        ball.mass = ball.size;
    }

    function handleSmileyCollision(ball, currentTime) {
        if (smiley) {
            smiley.remove();
            smiley = null;
        }
        ball.size = Math.min(ball.size * config.sizeIncrease, config.maxSize);
        ball.baseSpeed *= config.speedIncrease; // Увеличиваем базовую скорость
        ball.speedReductionEnd = currentTime + config.speedReductionTime; // Замедление на 3 секунды
        updateBallSpeed(ball, currentTime);
        score++;
        scoreDisplay.textContent = `Смайлики: ${score}`;

        ball.element.classList.add('flashing');
        setTimeout(() => ball.element.classList.remove('flashing'), 5000);

        setTimeout(createSmiley, 20000);
    }

    function isBallsColliding(ball1, ball2) {
        const dx = ball1.x + ball1.size / 2 - (ball2.x + ball2.size / 2);
        const dy = ball1.y + ball1.size / 2 - (ball2.y + ball2.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= (ball1.size / 2 + ball2.size / 2);
    }

    function handleBallCollision(ball1, ball2, currentTime) {
        const dx = ball2.x + ball2.size / 2 - (ball1.x + ball1.size / 2);
        const dy = ball2.y + ball2.size / 2 - (ball1.y + ball1.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return;

        const nx = dx / distance;
        const ny = dy / distance;

        const relativeVx = ball1.dx - ball2.dx;
        const relativeVy = ball1.dy - ball2.dy;
        const dotProduct = relativeVx * nx + relativeVy * ny;

        if (dotProduct > 0) return;

        const m1 = ball1.mass;
        const m2 = ball2.mass;
        const totalMass = m1 + m2;

        // Компоненты скорости вдоль нормали
        const v1 = ball1.dx * nx + ball1.dy * ny;
        const v2 = ball2.dx * nx + ball2.dy * ny;

        // Плавные "космические" отскоки с учётом массы
        const v1Final = (m1 - config.restitution * m2) * v1 / totalMass + (1 + config.restitution) * m2 * v2 / totalMass;
        const v2Final = (m2 - config.restitution * m1) * v2 / totalMass + (1 + config.restitution) * m1 * v1 / totalMass;

        // Плавное изменение скорости
        const damping = 0.3; // Уменьшаем резкость для "космического" эффекта
        ball1.dx += (v1Final - v1) * nx * damping;
        ball1.dy += (v1Final - v1) * ny * damping;
        ball2.dx += (v2Final - v2) * nx * damping;
        ball2.dy += (v2Final - v2) * ny * damping;

        // Временное замедление на 3 секунды
        ball1.speedReductionEnd = currentTime + config.speedReductionTime;
        ball2.speedReductionEnd = currentTime + config.speedReductionTime;

        const overlap = (ball1.size / 2 + ball2.size / 2) - distance;
        if (overlap > 0) {
            const pushFactor = 0.2; // Очень мягкое раздвигание
            ball1.x -= overlap * nx * pushFactor;
            ball1.y -= overlap * ny * pushFactor;
            ball2.x += overlap * nx * pushFactor;
            ball2.y += overlap * ny * pushFactor;
        }
    }

    function forceSeparateBalls(ball1, ball2) {
        const dx = ball2.x + ball2.size / 2 - (ball1.x + ball1.size / 2);
        const dy = ball2.y + ball2.size / 2 - (ball1.y + ball1.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return;

        const nx = dx / distance;
        const ny = dy / distance;

        const overlap = (ball1.size / 2 + ball2.size / 2) - distance;
        if (overlap > 0) {
            const pushForce = 3;
            ball1.dx -= pushForce * nx;
            ball1.dy -= pushForce * ny;
            ball2.dx += pushForce * nx;
            ball2.dy += pushForce * ny;

            ball1.x -= overlap * nx * 0.5;
            ball1.y -= overlap * ny * 0.5;
            ball2.x += overlap * nx * 0.5;
            ball2.y += overlap * ny * 0.5;
        }
    }

    function checkBallSize(ball) {
        if (ball.size >= config.sizeThreshold && balls.length < config.maxBalls) {
            ball.size = config.baseSize;
            ball.speed = config.baseSpeed;
            ball.baseSpeed = config.baseSpeed;
            updateBallSpeed(ball);

            const newBall = createBall(null, ball.color);
            balls.push(newBall);
        }
    }

    function checkCollisions(currentTime) {
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
                    handleSmileyCollision(ball, currentTime);
                }
            });
        }

        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                if (isBallsColliding(balls[i], balls[j])) {
                    handleBallCollision(balls[i], balls[j], currentTime);
                    balls[i].stuckTime += 16;
                    balls[j].stuckTime += 16;

                    if (balls[i].stuckTime >= config.stuckTimeThreshold) {
                        forceSeparateBalls(balls[i], balls[j]);
                        balls[i].stuckTime = 0;
                        balls[j].stuckTime = 0;
                    }
                } else {
                    balls[i].stuckTime = 0;
                    balls[j].stuckTime = 0;
                }
            }
        }
    }

    let lastTime = performance.now();
    function gameLoop() {
        try {
            const currentTime = performance.now();
            const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
            lastTime = currentTime;

            balls.forEach(ball => {
                ball.x += ball.dx * 60 * deltaTime;
                ball.y += ball.dy * 60 * deltaTime;

                if (ball.x < 0) {
                    ball.x = 0;
                    ball.dx = Math.abs(ball.dx) * config.restitution;
                    updateBallSpeed(ball, currentTime);
                }
                if (ball.x > window.innerWidth - ball.size) {
                    ball.x = window.innerWidth - ball.size;
                    ball.dx = -Math.abs(ball.dx) * config.restitution;
                    updateBallSpeed(ball, currentTime);
                }
                if (ball.y < 0) {
                    ball.y = 0;
                    ball.dy = Math.abs(ball.dy) * config.restitution;
                    updateBallSpeed(ball, currentTime);
                }
                if (ball.y > window.innerHeight - ball.size) {
                    ball.y = window.innerHeight - ball.size;
                    ball.dy = -Math.abs(ball.dy) * config.restitution;
                    updateBallSpeed(ball, currentTime);
                }

                ball.element.style.left = `${ball.x}px`;
                ball.element.style.top = `${ball.y}px`;
                ball.element.style.width = `${ball.size}px`;
                ball.element.style.height = `${ball.size}px`;

                createParticle(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.color);
                checkBallSize(ball);
                updateBallSpeed(ball, currentTime);
            });

            checkCollisions(currentTime);
        } catch (error) {
            console.error('Ошибка в игровом цикле:', error);
        }

        requestAnimationFrame(gameLoop);
    }

    createSmiley();
    gameLoop();
});