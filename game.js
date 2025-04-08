class Game {
    constructor() {
        this.character = document.getElementById('character');
        this.counter = document.getElementById('counter');
        this.trails = [];
        this.steps = 0;
        
        // Начальные координаты
        this.posX = window.innerWidth / 2 - 15;
        this.posY = window.innerHeight / 2 - 15;
        this.isMoving = true;
        this.speed = 2.5;
        
        this.init();
    }

    init() {
        // Настройка обработчиков событий
        window.addEventListener('resize', this.handleResize.bind(this));
        this.character.addEventListener('click', this.changeColor.bind(this));
        
        // Запуск игрового цикла
        this.gameLoop();
        this.updateCounter();
    }

    gameLoop() {
        if(this.isMoving) this.moveCharacter();
        this.updateTrails();
        requestAnimationFrame(() => this.gameLoop());
    }

    moveCharacter() {
        // Случайное направление
        const angle = Math.random() * Math.PI * 2;
        this.posX += Math.cos(angle) * this.speed;
        this.posY += Math.sin(angle) * this.speed;

        // Проверка границ экрана
        this.posX = Math.max(10, Math.min(this.posX, window.innerWidth - 40));
        this.posY = Math.max(10, Math.min(this.posY, window.innerHeight - 40));

        // Обновление позиции
        this.character.style.left = `${this.posX}px`;
        this.character.style.top = `${this.posY}px`;

        // Создание следа
        this.createTrail();

        // Счетчик шагов и случайная остановка
        this.steps++;
        if(Math.random() < 0.008) this.toggleMovement();
    }

    createTrail() {
        const trail = document.createElement('div');
        trail.className = 'trail';
        trail.style.left = `${this.posX + 15}px`;
        trail.style.top = `${this.posY + 15}px`;
        document.body.appendChild(trail);
        this.trails.push(trail);
    }

    updateTrails() {
        this.trails = this.trails.filter(trail => {
            const opacity = parseFloat(trail.style.opacity || 1);
            trail.style.opacity = opacity - 0.02;
            
            if(opacity <= 0) {
                trail.remove();
                return false;
            }
            return true;
        });
    }

    toggleMovement() {
        this.isMoving = !this.isMoving;
        this.character.style.background = this.isMoving ? '#ff6b6b' : '#4ecdc4';
        if(!this.isMoving) setTimeout(() => this.toggleMovement(), 1500);
    }

    changeColor() {
        const hue = Math.random() * 360;
        this.character.style.background = `hsl(${hue}, 70%, 60%)`;
        this.character.style.boxShadow = `0 0 20px hsl(${hue}, 70%, 50%)`;
    }

    handleResize() {
        this.posX = Math.min(this.posX, window.innerWidth - 40);
        this.posY = Math.min(this.posY, window.innerHeight - 40);
    }

    updateCounter() {
        this.counter.textContent = `Steps: ${this.steps}`;
        setTimeout(() => this.updateCounter(), 100);
    }
}

// Запуск игры
new Game();