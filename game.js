document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('character');
    const counter = document.getElementById('counter');
    
    // Настройки
    const size = 50;
    let posX = window.innerWidth/2 - size/2;
    let posY = window.innerHeight/2 - size/2;
    let steps = 0;
    let isMoving = true;
    let currentAngle = Math.random() * Math.PI * 2;
    
    // Инициализация
    character.style.width = `${size}px`;
    character.style.height = `${size}px`;
    updatePosition();
    
    // Игровой цикл
    function gameLoop() {
        if (isMoving) {
            moveCharacter();
            steps++;
            counter.textContent = `Steps: ${steps}`;
            
            // Случайная остановка
            if (Math.random() < 0.005) {
                toggleMovement();
            }
        }
        requestAnimationFrame(gameLoop);
    }
    
    function moveCharacter() {
        // Изменение направления каждые 60 кадров
        if (steps % 60 === 0) {
            currentAngle = Math.random() * Math.PI * 2;
        }
        
        posX += Math.cos(currentAngle) * 2;
        posY += Math.sin(currentAngle) * 2;
        
        // Проверка границ с отскоком
        if (posX < 0) {
            posX = 0;
            currentAngle = Math.PI - currentAngle;
        }
        if (posX > window.innerWidth - size) {
            posX = window.innerWidth - size;
            currentAngle = Math.PI - currentAngle;
        }
        if (posY < 0) {
            posY = 0;
            currentAngle = -currentAngle;
        }
        if (posY > window.innerHeight - size) {
            posY = window.innerHeight - size;
            currentAngle = -currentAngle;
        }
        
        updatePosition();
    }
    
    function updatePosition() {
        character.style.left = `${posX}px`;
        character.style.top = `${posY}px`;
    }
    
    function toggleMovement() {
        isMoving = !isMoving;
        character.style.background = isMoving ? 'red' : '#0f0';
        if (!isMoving) {
            setTimeout(toggleMovement, 1000 + Math.random() * 2000);
        }
    }
    
    // Клик для изменения размера
    character.addEventListener('click', () => {
        const newSize = 30 + Math.random() * 40;
        character.style.width = `${newSize}px`;
        character.style.height = `${newSize}px`;
    });
    
    // Запуск игры
    gameLoop();
});