const character = document.getElementById('character');
let posX = 500;
let posY = 300;
let direction = 1;
let isMoving = true;

// Загрузите этот спрайт или создайте свой: https://i.imgur.com/BDqQ6WX.png
// Сохраните как sprite.png в папке проекта

function moveCharacter() {
    if (!isMoving) return;

    const speed = 2;
    const angle = Math.random() * Math.PI * 2;
    
    posX += Math.cos(angle) * speed;
    posY += Math.sin(angle) * speed;
    
    // Проверка границ экрана
    if (posX < 0 || posX > window.innerWidth - 64) {
        direction *= -1;
        character.style.transform = `scaleX(${direction})`;
    }
    
    character.style.left = posX + 'px';
    character.style.top = posY + 'px';
    
    // Случайная остановка
    if (Math.random() < 0.02) {
        toggleMovement();
    }
}

function toggleMovement() {
    isMoving = !isMoving;
    character.classList.toggle('walk');
    if (isMoving) setTimeout(toggleMovement, Math.random() * 2000 + 1000);
}

// Старт анимации
character.classList.add('walk');
setInterval(moveCharacter, 1000/60);

// Поворот при клике для теста
character.addEventListener('click', () => {
    direction *= -1;
    character.style.transform = `scaleX(${direction})`;
});
