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
        });
    }

    // Создание смайлика (ИСПРАВЛЕННАЯ ЧАСТЬ)
    function createSmiley() {
        if (smiley) smiley.remove();
        
        const smileys = ['😀', '😎', '🤩', '😍', '🥳', '🤪'];
        smiley = document.createElement('div');
        smiley.className = 'smiley';
        smiley.textContent = smileys[Math.floor(Math.random() * smileys.length)];
        smiley.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
        smiley.style.top = `${Math.random() * (window.innerHeight - 50)}px`;
        document.body.appendChild(smiley); // Было document.body.appendChild(smile);
        
        smileyTimeout = setTimeout(createSmiley, config.smileySpawnDelay);
    }

    // Обновление элемента шарика
    function updateBallElement(ball) {
        ball.element.style.width = `${ball.size}px`;
        ball.element.style.height = `${ball.size}px`;
        ball.element.style.left = `${ball.x}px`;
        ball.element.style.top = `${ball.y}px`;
    }

    // Изменение скорости шарика
    function changeBallSpeed(ball, factor) {
        ball.speed *= factor;
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        const ratio = ball.speed / currentSpeed;
        ball.dx *= ratio;
        ball.dy *= ratio;
    }

    // Остальные функции остаются без изменений (как в предыдущем коде)
    // ... (updateBallElement, changeBallSize, createParticle, checkCollisions и т.д.)

    // НОВАЯ ВЕРСИЯ ИГРОВОГО ЦИКЛА (более стабильная)
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
            if (ball.x <= 0) {
                ball.x = 0;
                ball.dx = Math.abs(ball.dx);
            }
            if (ball.x >= window.innerWidth - ball.size) {
                ball.x = window.innerWidth - ball.size;
                ball.dx = -Math.abs(ball.dx);
            }
            if (ball.y <= 0) {
                ball.y = 0;
                ball.dy = Math.abs(ball.dy);
            }
            if (ball.y >= window.innerHeight - ball.size) {
                ball.y = window.innerHeight - ball.size;
                ball.dy = -Math.abs(ball.dy);
            }
            
            updateBallElement(ball);
            
            // Создание частиц
            if (Math.random() < 0.3) {
                createParticle(
                    oldX + ball.size/2,
                    oldY + ball.size/2,
                    ball.element.style.backgroundColor
                );
            }
        });
        
        // Обновление частиц
        updateParticles();
        
        // Проверка столкновений
        checkCollisions();
        
        requestAnimationFrame(gameLoop);
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].life -= 16;
            particles[i].element.style.opacity = particles[i].life / config.particleLife;
            
            if (particles[i].life <= 0) {
                particles[i].element.remove();
                particles.splice(i, 1);
            }
        }
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