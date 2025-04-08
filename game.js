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

    // Обновление позиции шарика
    function updateBall(ball) {
        ball.element.style.left = `${ball.x}px`;
        ball.element.style.top = `${ball.y}px`;
        ball.element.style.width = `${ball.size}px`;
        ball.element.style.height = `${ball.size}px`;
    }

    // Игровой цикл
    function gameLoop() {
        balls.forEach(ball => {
            // Движение
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Границы экрана
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

            updateBall(ball);
        });

        requestAnimationFrame(gameLoop);
    }

    // Инициализация
    function init() {
        // Запуск движения
        gameLoop();
        
        // Первый смайлик
        setTimeout(createSmiley, 1000);
        
        // Обработка ресайза
        window.addEventListener('resize', () => {
            balls.forEach(ball => {
                ball.x = Math.max(0, Math.min(ball.x, window.innerWidth - ball.size));
                ball.y = Math.max(0, Math.min(ball.y, window.innerHeight - ball.size));
                updateBall(ball);
            });
        });
    }

    init();
});