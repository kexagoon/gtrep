document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация игры
    const config = {
        baseSpeed: 2,
        baseSize: 50,
        minSize: 25,
        maxSize: 150,
        speedIncrease: 1.15,
        speedDecrease: 0.95,
        particleLife: 1000,
        smileySpawnDelay: 20000
    };

    // Элементы игры
    const balls = [
        createBall('red-ball', 'red'),
        createBall('green-ball', 'green'),
        createBall('blue-ball', 'blue')
    ];
    
    let smiley = null;
    let smileyTimeout = null;
    let score = 0;
    const particles = [];
    const scoreDisplay = document.getElementById('score-display');

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
        if (smiley) smiley.remove();
        
        const smileys = ['😀', '😎', '🤩', '😍', '🥳', '🤪'];
        smiley = document.createElement('div');
        smiley.className = 'smiley';
        smiley.textContent = smileys[Math.floor(Math.random() * smileys.length)];
        smiley.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
        smiley.style.top = `${Math.random() * (window.innerHeight - 50)}px`;
        document.body.appendChild(smiley);
        
        smileyTimeout = setTimeout(createSmiley, config.smileySpawnDelay);
    }

    // Создание частицы
    function createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            background: ${color};
            opacity: 0.8;
        `;
        document.body.appendChild(particle);
        particles.push({ element: particle, life: config.particleLife });
    }

    // Проверка столкновений
    function checkCollisions() {
        // Со смайликом
        if (smiley) {
            const smileyRect = smiley.getBoundingClientRect();
            balls.forEach(ball => {
                const ballRect = ball.element.getBoundingClientRect();
                if (isColliding(ballRect, smileyRect)) {
                    handleSmileyCollision(ball);
                }
            });
        }
        
        // Между шариками
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

    // Обработка столкновения с смайликом
    function handleSmileyCollision(ball) {
        smiley.remove();
        smiley = null;
        ball.size = Math.min(ball.size * 1.15, config.maxSize);
        ball.speed *= 1.15;
        updateBallSpeed(ball);
        score++;
        scoreDisplay.textContent = `Шарики: 3 | Смайлики: ${score}`;
        clearTimeout(smileyTimeout);
        setTimeout(createSmiley, config.smileySpawnDelay);
    }

    // Обработка столкновения шариков
    function handleBallCollision(ball1, ball2) {
        // Изменение размеров
        ball1.size = Math.max(ball1.size * 0.95, config.minSize);
        ball2.size = Math.max(ball2.size * 0.95, config.minSize);
        
        // Изменение скорости
        ball1.speed *= 0.95;
        ball2.speed *= 0.95;
        updateBallSpeed(ball1);
        updateBallSpeed(ball2);
        
        // Физика отскока
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

    // Обновление скорости
    function updateBallSpeed(ball) {
        const ratio = ball.speed / Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        ball.dx *= ratio;
        ball.dy *= ratio;
    }

    // Проверка столкновения прямоугольников
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
        const dx = ball1.x + ball1.size/2 - (ball2.x + ball2.size/2);
        const dy = ball1.y + ball1.size/2 - (ball2.y + ball2.size/2);
        return Math.sqrt(dx*dx + dy*dy) < (ball1.size/2 + ball2.size/2);
    }

    // Игровой цикл
    function gameLoop() {
        // Движение и границы
        balls.forEach(ball => {
            ball.x += ball.dx;
            ball.y += ball.dy;
            
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
            
            ball.element.style.left = `${ball.x}px`;
            ball.element.style.top = `${ball.y}px`;
            ball.element.style.width = `${ball.size}px`;
            ball.element.style.height = `${ball.size}px`;
            
            // Следы частиц
            if (Math.random() < 0.5) {
                createParticle(
                    ball.x + ball.size/2,
                    ball.y + ball.size/2,
                    ball.color
                );
            }
        });
        
        // Обновление частиц
        particles.forEach((p, i) => {
            p.life -= 16;
            p.element.style.opacity = p.life / config.particleLife;
            if (p.life <= 0) {
                p.element.remove();
                particles.splice(i, 1);
            }
        });
        
        checkCollisions();
        requestAnimationFrame(gameLoop);
    }

    // Запуск игры
    createSmiley();
    gameLoop();
});