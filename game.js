document.addEventListener('DOMContentLoaded', () => {
    // Настройки игры
    const config = {
        ballCount: 3,
        baseSize: 50,
        maxSize: 150, // 300% от базового
        minSize: 25,  // 50% от базового
        speed: 2,
        smileySpawnDelay: 20000, // 20 секунд
        particleLife: 1000 // 1 секунда
    };

    // Элементы игры
    const balls = [
        { id: 'red-ball', color: 'red', element: document.getElementById('red-ball'), size: config.baseSize, x: 0, y: 0, dx: 0, dy: 0 },
        { id: 'green-ball', color: 'green', element: document.getElementById('green-ball'), size: config.baseSize, x: 0, y: 0, dx: 0, dy: 0 },
        { id: 'blue-ball', color: 'blue', element: document.getElementById('blue-ball'), size: config.baseSize, x: 0, y: 0, dx: 0, dy: 0 }
    ];
    
    const scoreDisplay = document.getElementById('score-display');
    const particles = [];
    let smiley = null;
    let smileyTimeout = null;
    let score = 0;

    // Инициализация шариков
    function initBalls() {
        balls.forEach(ball => {
            // Начальная позиция
            ball.x = Math.random() * (window.innerWidth - config.baseSize);
            ball.y = Math.random() * (window.innerHeight - config.baseSize);
            
            // Начальное направление
            const angle = Math.random() * Math.PI * 2;
            ball.dx = Math.cos(angle) * config.speed;
            ball.dy = Math.sin(angle) * config.speed;
            
            // Настройка элемента
            ball.element.style.width = `${config.baseSize}px`;
            ball.element.style.height = `${config.baseSize}px`;
            updateBallPosition(ball);
            
            // Клик для изменения размера
            ball.element.addEventListener('click', () => {
                changeBallSize(ball, 1.2);
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
        
        document.body.appendChild(smiley);
        
        // Удаление через 20 секунд если не собран
        smileyTimeout = setTimeout(createSmiley, config.smileySpawnDelay);
    }

    // Создание частицы
    function createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = color;
        particle.style.opacity = '0.8';
        
        document.body.appendChild(particle);
        particles.push({
            element: particle,
            life: config.particleLife
        });
    }

    // Обновление позиции шарика
    function updateBallPosition(ball) {
        ball.element.style.left = `${ball.x}px`;
        ball.element.style.top = `${ball.y}px`;
        ball.element.style.width = `${ball.size}px`;
        ball.element.style.height = `${ball.size}px`;
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
        updateBallPosition(ball);
    }

    // Проверка столкновений
    function checkCollisions() {
        // Проверка смайлика
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
                    // Столкновение с смайликом
                    smiley.remove();
                    smiley = null;
                    changeBallSize(ball, 1.1);
                    score++;
                    scoreDisplay.textContent = `Шарики: 3 | Смайлики: ${score}`;
                    clearTimeout(smileyTimeout);
                    setTimeout(createSmiley, config.smileySpawnDelay);
                }
            });
        }
        
        // Проверка столкновений между шариками
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                const ball1 = balls[i];
                const ball2 = balls[j];
                
                const dx = ball1.x + ball1.size/2 - (ball2.x + ball2.size/2);
                const dy = ball1.y + ball1.size/2 - (ball2.y + ball2.size/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < (ball1.size/2 + ball2.size/2)) {
                    // Столкновение шариков
                    changeBallSize(ball1, 0.9);
                    changeBallSize(ball2, 0.9);
                    
                    // Отскок
                    const angle = Math.atan2(dy, dx);
                    const force = 2;
                    
                    ball1.dx = Math.cos(angle) * force;
                    ball1.dy = Math.sin(angle) * force;
                    ball2.dx = Math.cos(angle + Math.PI) * force;
                    ball2.dy = Math.sin(angle + Math.PI) * force;
                }
            }
        }
    }

    // Игровой цикл
    function gameLoop() {
        // Движение шариков
        balls.forEach(ball => {
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // Отскок от границ
            if (ball.x <= 0 || ball.x >= window.innerWidth - ball.size) {
                ball.dx *= -1;
                ball.x = Math.max(0, Math.min(ball.x, window.innerWidth - ball.size));
            }
            if (ball.y <= 0 || ball.y >= window.innerHeight - ball.size) {
                ball.dy *= -1;
                ball.y = Math.max(0, Math.min(ball.y, window.innerHeight - ball.size));
            }
            
            updateBallPosition(ball);
            
            // Создание частиц
            if (Math.random() < 0.3) {
                createParticle(
                    ball.x + ball.size/2 + (Math.random() * 10 - 5),
                    ball.y + ball.size/2 + (Math.random() * 10 - 5),
                    ball.color
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
        
        // Случайное изменение направления
        if (Math.random() < 0.01) {
            balls.forEach(ball => {
                const angle = Math.random() * Math.PI * 2;
                ball.dx = Math.cos(angle) * config.speed;
                ball.dy = Math.sin(angle) * config.speed;
            });
        }
        
        requestAnimationFrame(gameLoop);
    }

    // Запуск игры
    initBalls();
    createSmiley();
    gameLoop();

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        balls.forEach(ball => {
            ball.x = Math.max(0, Math.min(ball.x, window.innerWidth - ball.size));
            ball.y = Math.max(0, Math.min(ball.y, window.innerHeight - ball.size));
            updateBallPosition(ball);
        });
    });
});