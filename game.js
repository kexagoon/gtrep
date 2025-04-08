document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация игры
    const config = {
        baseSpeed: 2,
        baseSize: 50,
        minSize: 25,
        maxSize: 150,
        speedIncrease: 1.15, // +15%
        speedDecrease: 0.95,  // -5%
        sizeIncrease: 1.15,   // +15%
        sizeDecrease: 0.95,   // -5%
        smileySpawnDelay: 20000,
        particleLife: 1000
    };

    // Состояние игры
    const balls = [
        { id: 'red-ball', element: document.getElementById('red-ball'), 
          x: 0, y: 0, dx: 0, dy: 0, size: config.baseSize, speed: config.baseSpeed },
        { id: 'green-ball', element: document.getElementById('green-ball'), 
          x: 0, y: 0, dx: 0, dy: 0, size: config.baseSize, speed: config.baseSpeed },
        { id: 'blue-ball', element: document.getElementById('blue-ball'), 
          x: 0, y: 0, dx: 0, dy: 0, size: config.baseSize, speed: config.baseSpeed }
    ];
    
    let smiley = null;
    let smileyTimeout = null;
    let score = 0;
    const particles = [];
    const scoreDisplay = document.getElementById('score-display');

    // Инициализация шариков
    function initBalls() {
        balls.forEach(ball => {
            // Начальная позиция
            ball.x = Math.random() * (window.innerWidth - config.baseSize);
            ball.y = Math.random() * (window.innerHeight - config.baseSize);
            
            // Начальное направление
            const angle = Math.random() * Math.PI * 2;
            ball.dx = Math.cos(angle) * ball.speed;
            ball.dy = Math.sin(angle) * ball.speed;
            
            updateBallElement(ball);
            
            // Клик для тестирования
            ball.element.addEventListener('click', () => {
                changeBallSize(ball, config.sizeIncrease);
                changeBallSpeed(ball, config.speedIncrease);
            });
        });
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
        document.body.appendChild(smile);
        
        smileyTimeout = setTimeout(createSmiley, config.smileySpawnDelay);
    }

    // Обновление элемента шарика
    function updateBallElement(ball) {
        ball.element.style.width = `${ball.size}px`;
        ball.element.style.height = `${ball.size}px`;
        ball.element.style.left = `${ball.x}px`;
        ball.element.style.top = `${ball.y}px`;
    }

    // Изменение размера шарика
    function changeBallSize(ball, factor) {
        ball.size = Math.max(
            config.minSize,
            Math.min(
                config.maxSize,
                ball.size * factor
            )
        );
        updateBallElement(ball);
    }

    // Изменение скорости шарика
    function changeBallSpeed(ball, factor) {
        const newSpeed = ball.speed * factor;
        const ratio = newSpeed / Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx *= ratio;
        ball.dy *= ratio;
        ball.speed = newSpeed;
    }

    // Создание частицы
    function createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = color;
        document.body.appendChild(particle);
        
        particles.push({
            element: particle,
            life: config.particleLife
        });
    }

    // Проверка столкновений
    function checkCollisions() {
        // Смайлик
        if (smiley) {
            const smileyRect = smiley.getBoundingClientRect();
            
            balls.forEach(ball => {
                const ballRect = ball.element.getBoundingClientRect();
                
                if (isColliding(ballRect, smileyRect)) {
                    // Столкновение с смайликом
                    smiley.remove();
                    smiley = null;
                    changeBallSize(ball, config.sizeIncrease);
                    changeBallSpeed(ball, config.speedIncrease);
                    score++;
                    scoreDisplay.textContent = `Шарики: 3 | Смайлики: ${score}`;
                    clearTimeout(smileyTimeout);
                    setTimeout(createSmiley, config.smileySpawnDelay);
                }
            });
        }
        
        // Шарики между собой
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                const ball1 = balls[i];
                const ball2 = balls[j];
                
                if (isBallColliding(ball1, ball2)) {
                    // Физика столкновения
                    const dx = ball2.x - ball1.x;
                    const dy = ball2.y - ball1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Нормализация
                    const nx = dx / distance;
                    const ny = dy / distance;
                    
                    // Импульс
                    const p = 2 * (ball1.dx * nx + ball1.dy * ny - ball2.dx * nx - ball2.dy * ny) / 
                              (ball1.size + ball2.size);
                    
                    // Изменение скоростей
                    ball1.dx -= p * ball2.size * nx;
                    ball1.dy -= p * ball2.size * ny;
                    ball2.dx += p * ball1.size * nx;
                    ball2.dy += p * ball1.size * ny;
                    
                    // Изменение размеров и скоростей (-5%)
                    changeBallSize(ball1, config.sizeDecrease);
                    changeBallSize(ball2, config.sizeDecrease);
                    changeBallSpeed(ball1, config.speedDecrease);
                    changeBallSpeed(ball2, config.speedDecrease);
                }
            }
        }
    }

    // Проверка столкновения двух шариков
    function isBallColliding(ball1, ball2) {
        const dx = ball1.x + ball1.size/2 - (ball2.x + ball2.size/2);
        const dy = ball1.y + ball1.size/2 - (ball2.y + ball2.size/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (ball1.size/2 + ball2.size/2);
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

    // Игровой цикл
    function gameLoop() {
        // Движение шариков
        balls.forEach(ball => {
            // Сохраняем старую позицию для частиц
            const oldX = ball.x;
            const oldY = ball.y;
            
            // Обновление позиции
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // Столкновение с границами
            let bounced = false;
            if (ball.x <= 0) {
                ball.x = 0;
                ball.dx = Math.abs(ball.dx);
                bounced = true;
            }
            if (ball.x >= window.innerWidth - ball.size) {
                ball.x = window.innerWidth - ball.size;
                ball.dx = -Math.abs(ball.dx);
                bounced = true;
            }
            if (ball.y <= 0) {
                ball.y = 0;
                ball.dy = Math.abs(ball.dy);
                bounced = true;
            }
            if (ball.y >= window.innerHeight - ball.size) {
                ball.y = window.innerHeight - ball.size;
                ball.dy = -Math.abs(ball.dy);
                bounced = true;
            }
            
            updateBallElement(ball);
            
            // Создание частиц
            if (Math.random() < 0.3) {
                createParticle(
                    oldX + ball.size/2 + (Math.random() * 10 - 5),
                    oldY + ball.size/2 + (Math.random() * 10 - 5),
                    ball.element.style.backgroundColor
                );
            }
        });
        
        // Обновление частиц
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].life -= 16;
            particles[i].element.style.opacity = particles[i].life / config.particleLife;
            
            if (particles[i].life <= 0) {
                particles[i].element.remove();
                particles.splice(i, 1);
            }
        }
        
        // Проверка столкновений
        checkCollisions();
        
        requestAnimationFrame(gameLoop);
    }

    // Запуск игры
    initBalls();
    createSmiley();
    gameLoop();

    // Обработка ресайза
    window.addEventListener('resize', () => {
        balls.forEach(ball => {
            ball.x = Math.max(0, Math.min(ball.x, window.innerWidth - ball.size));
            ball.y = Math.max(0, Math.min(ball.y, window.innerHeight - ball.size));
            updateBallElement(ball);
        });
    });
});