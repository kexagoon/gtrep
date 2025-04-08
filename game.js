class Walker {
    constructor() {
        this.character = document.getElementById('character');
        this.counter = document.getElementById('counter');
        this.trails = [];
        this.steps = 0;
        this.isMoving = true;
        this.speed = 3;
        this.baseSize = 40;
        
        this.initPosition();
        this.initEventListeners();
        this.startGameLoop();
    }

    initPosition() {
        const rect = this.character.getBoundingClientRect();
        this.posX = window.innerWidth/2 - rect.width/2;
        this.posY = window.innerHeight/2 - rect.height/2;
        this.updatePosition();
    }

    initEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        this.character.addEventListener('click', () => this.changeAppearance());
    }

    startGameLoop() {
        const move = () => {
            if(this.isMoving) {
                this.move();
                this.createTrail();
                this.steps++;
                this.counter.textContent = `Steps: ${this.steps}`;
                
                if(Math.random() < 0.01) this.toggleMovement();
            }
            requestAnimationFrame(move);
        };
        move();
    }

    move() {
        const angle = Math.random() * Math.PI * 2;
        const newX = this.posX + Math.cos(angle) * this.speed;
        const newY = this.posY + Math.sin(angle) * this.speed;

        this.posX = Math.max(0, Math.min(newX, window.innerWidth - this.baseSize));
        this.posY = Math.max(0, Math.min(newY, window.innerHeight - this.baseSize));
        
        this.updatePosition();
    }

    updatePosition() {
        this.character.style.left = `${this.posX}px`;
        this.character.style.top = `${this.posY}px`;
    }

    createTrail() {
        const trail = document.createElement('div');
        trail.className = 'trail';
        trail.style.left = `${this.posX + this.baseSize/2}px`;
        trail.style.top = `${this.posY + this.baseSize/2}px`;
        document.body.appendChild(trail);
        
        setTimeout(() => {
            trail.style.opacity = '0';
            setTimeout(() => trail.remove(), 1000);
        }, 100);
    }

    toggleMovement() {
        this.isMoving = !this.isMoving;
        this.character.style.backgroundColor = this.isMoving ? '#ff4444' : '#44ff44';
        if(!this.isMoving) setTimeout(() => this.toggleMovement(), 1000 + Math.random() * 2000);
    }

    changeAppearance() {
        const randomHue = Math.floor(Math.random() * 360);
        const newSize = 30 + Math.random() * 20;
        
        this.character.style.backgroundColor = `hsl(${randomHue}, 70%, 60%)`;
        this.character.style.width = `${newSize}px`;
        this.character.style.height = `${newSize}px`;
        this.baseSize = newSize;
    }

    handleResize() {
        this.posX = Math.min(this.posX, window.innerWidth - this.baseSize);
        this.posY = Math.min(this.posY, window.innerHeight - this.baseSize);
        this.updatePosition();
    }
}

// Инициализация при полной загрузке страницы
window.addEventListener('load', () => new Walker());