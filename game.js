class WalkerGame {
    constructor() {
        this.character = document.getElementById('character');
        this.counter = document.getElementById('counter');
        this.trails = [];
        this.steps = 0;
        this.isMoving = true;
        this.speed = 2;
        this.baseSize = 50;
        this.directionChangeInterval = 60;
        this.frameCount = 0;

        // Инициализация
        this.initCharacter();
        this.initEventListeners();
        this.startGameLoop();
    }

    initCharacter() {
        // Гарантированная видимая начальная позиция
        this.posX = window.innerWidth / 2 - this.baseSize / 2;
        this.posY = window.innerHeight / 2 - this.baseSize / 2;
        this.updatePosition();
        
        // Яркий начальный цвет
        this.character.style.backgroundColor = '#ff4444';
        this.character.style.boxShadow = '0 0 25px rgba(255, 68, 68, 0.7)';
    }

    initEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
        this.character.addEventListener('click', this.changeAppearance.bind(this));
    }

    startGameLoop() {
        const gameLoop = () => {
            if (this.isMoving) {
                this.moveCharacter();
                this.createTrail();
                this.steps++;
                this.counter.textContent = `Steps: ${this.steps}`;
            }
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    moveCharacter() {
        this.frameCount++;
        
        // Меняем направление через определенные интервалы
        if (this.frameCount % this.directionChangeInterval === 0) {
            this.currentAngle = Math.random() * Math.PI * 2;
            
            // Случайная остановка
            if (Math.random() < 0.1) {
                this.toggleMovement();
            }
        }

        const moveX = Math.cos(this.currentAngle) * this.speed;
        const moveY = Math.sin(this.currentAngle) * this.speed;

        this.posX += moveX;
        this.posY += moveY;

        // Проверка границ с "отскоком"
        if (this.posX <= 0 || this.posX >= window.innerWidth - this.baseSize) {
            this.currentAngle = Math.PI - this.currentAngle;
            this.posX = Math.max(0, Math.min(this.posX, window.innerWidth - this.baseSize));
        }
        
        if (this.posY <= 0 || this.posY >= window.innerHeight - this.baseSize) {
            this.currentAngle = -this.currentAngle;
            this.posY = Math.max(0, Math.min(this.posY, window.innerHeight - this.baseSize));
        }

        this.updatePosition();
    }

    updatePosition() {
        this.character.style.left = `${this.posX}px`;
        this.character.style.top = `${this.posY}px`;
    }

    createTrail() {
        const trail = document.createElement('div');
        trail.className = 'trail';
        trail.style.left = `${this.posX + this.baseSize/2 - 5}px`;
        trail.style.top = `${this.posY + this.baseSize/2 - 5}px`;
        document.body.appendChild(trail);

        // Плавное исчезновение следа
        let opacity = 0.6;
        const fadeInterval = setInterval(() => {
            opacity -= 0.02;
            trail.style.opacity = opacity;
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                trail.remove();
            }
        }, 50);
    }

    toggleMovement() {
        this.isMoving = !this.isMoving;
        if (this.isMoving) {
            this.character.style.backgroundColor = '#ff4444';
            this.character.style.boxShadow = '0 0 25px rgba(255, 68, 68, 0.7)';
        } else {
            this.character.style.backgroundColor = '#44ff44';
            this.character.style.boxShadow = '0 0 25px rgba(68, 255, 68, 0.7)';
            setTimeout(() => this.toggleMovement(), 1500 + Math.random() * 2000);
        }
    }

    changeAppearance() {
        const hue = Math.floor(Math.random() * 360);
        const size = 40 + Math.floor(Math.random() * 30);
        
        this.baseSize = size;
        this.character.style.width = `${size}px`;
        this.character.style.height = `${size}px`;
        this.character.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;
        this.character.style.boxShadow = `0 0 25px hsl(${hue}, 80%, 50%)`;
    }

    handleResize() {
        this.posX = Math.min(this.posX, window.innerWidth - this.baseSize);
        this.posY = Math.min(this.posY, window.innerHeight - this.baseSize);
        this.updatePosition();
    }
}

// Запуск игры после полной загрузки страницы
window.addEventListener('load', () => {
    new WalkerGame();
});