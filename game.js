const character = document.getElementById('character');
let posX = window.innerWidth/2 - 20;
let posY = window.innerHeight/2 - 20;
let direction = 1;
let isMoving = true;

function moveCharacter() {
    if (!isMoving) return;

    const speed = 3;
    const angle = Math.random() * Math.PI * 2;
    
    posX += Math.cos(angle) * speed;
    posY += Math.sin(angle) * speed;
    
    // Проверка границ экрана
    if (posX < 0 || posX > window.innerWidth - 40) {
        direction *= -1;
        posX = Math.max(0, Math.min(posX, window.innerWidth - 40));
    }
    
    if (posY < 0 || posY > window.innerHeight - 40) {
        posY = Math.max(0, Math.min(posY, window.innerHeight - 40));
    }
    
    character.style.left = posX + 'px';
    character.style.top = posY + 'px';
    
    // Случайная остановка и смена цвета
    if (Math.random() < 0.015) {
        toggleMovement();
        if (!isMoving) {
            character.style.backgroundColor = '#44ff44';
        } else {
            character.style.backgroundColor = '#ff4444';
        }
    }
}

function toggleMovement() {
    isMoving = !isMoving;
    if (isMoving) setTimeout(toggleMovement, Math.random() * 2000 + 1000);
}

// Старт движения
setInterval(moveCharacter, 1000/60);

// Клик меняет размер
character.addEventListener('click', () => {
    character.style.transform = `scale(${Math.random() * 0.5 + 0.8})`;
});