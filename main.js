
// Объявление глобальных переменных
const canvas = document.getElementById("simulation");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let creatures = [];
let foods = [];
let birthStats = { red: 0, green: 0, blue: 0 };
let deathStats = { red: 0, green: 0, blue: 0 };

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Настройки
function getTypeSettings(type) {
    return {
        enabled: document.getElementById(`enable${type}`).checked,
        count: parseInt(document.getElementById(`start${type}`).value),
        speed: parseFloat(document.getElementById(`speed${type}`).value),
        aggression: parseFloat(document.getElementById(`aggr${type}`).value),
        hunger: parseFloat(document.getElementById(`hung${type}`).value)
    };
}

function getGlobalSettings() {
    return {
        maxCreatures: parseInt(document.getElementById("maxCreatures").value),
        mutationChance: parseFloat(document.getElementById("mutationChance").value),
        maxFood: parseInt(document.getElementById("maxFood").value),
        radius: parseInt(document.getElementById("radius").value)
    };
}

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

const COLORS = {
    red: "#ff3b3b",
    green: "#3bff3b",
    blue: "#3b3bff"
};

class Food {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
    }

    draw() {
        ctx.fillStyle = "#f0e68c";
        ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
    }
}

class Creature {
    constructor(type, x, y, genes = null) {
        const global = getGlobalSettings();
        const local = getTypeSettings(capitalize(type));

        this.type = type;
        this.x = x ?? Math.random() * canvas.width;
        this.y = y ?? Math.random() * canvas.height;
        this.radius = global.radius;
        this.color = COLORS[type];
        this.genes = genes ?? {
            speed: local.speed,
            aggression: local.aggression,
            hunger: local.hunger
        };

        this.energy = 100;
        this.age = 0;
        this.cooldown = 0;
        this.angle = Math.random() * Math.PI * 2;
        this.turnSpeed = 0;

        this.bornTime = Date.now();
        this.deathStarted = null;

        birthStats[type]++;
    }

    update() {
        this.age++;
        this.energy -= 0.05;

        if (this.cooldown > 0) this.cooldown--;
        this.think();
        this.move();

        if (this.energy <= 0 && !this.deathStarted) {
            this.deathStarted = Date.now();
            deathStats[this.type]++;
        }
    }

    move() {
        this.turnSpeed += (Math.random() - 0.5) * 0.02;
        this.turnSpeed *= 0.9;
        this.angle += this.turnSpeed;

        const speed = this.genes.speed;
        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;

        if (this.x < this.radius || this.x > canvas.width - this.radius) {
            this.angle = Math.PI - this.angle;
        }
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
            this.angle = -this.angle;
        }
    }

    think() {
        // Упрощённый ИИ: избегание смерти, поиск еды
        let bestTarget = null;
        let bestScore = -Infinity;

        for (let f of foods) {
            const dx = f.x - this.x;
            const dy = f.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const score = this.genes.hunger * (1 / (dist + 1));
            if (score > bestScore) {
                bestScore = score;
                bestTarget = { x: f.x, y: f.y };
            }
        }

        if (bestTarget) {
            const dx = bestTarget.x - this.x;
            const dy = bestTarget.y - this.y;
            const angleTo = Math.atan2(dy, dx);
            let delta = angleTo - this.angle;
            delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
            this.turnSpeed += delta * 0.1;
        }
    }

    eat(food) {
        const dx = food.x - this.x;
        const dy = food.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.radius + 3) {
            this.energy += 30;
            return true;
        }
        return false;
    }

    draw() {
        let alpha = 1;
        let fillColor = this.color;
        const now = Date.now();

        if (this.bornTime && now - this.bornTime < 2000) {
            alpha = Math.abs(Math.sin((now - this.bornTime) / 200)) * 0.6 + 0.4;
        }

        if (this.deathStarted) {
            const dt = (now - this.deathStarted) / 1000;
            if (dt >= 3) {
                fillColor = "#000000";
            } else if (dt >= 0) {
                fillColor = "#888888";
            }
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    isDead() {
        return this.deathStarted && Date.now() - this.deathStarted > 10000;
    }

    interact(other) {
        if (this === other) return;
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.radius * 2 && this.type === other.type && this.cooldown === 0 && other.cooldown === 0) {
            if (creatures.length < getGlobalSettings().maxCreatures) {
                const childGenes = averageGenes(this.genes, other.genes);
                creatures.push(new Creature(this.type, this.x, this.y, childGenes));
                this.energy -= 15;
                other.energy -= 15;
                this.cooldown = 100;
                other.cooldown = 100;
            }
        }
    }
}

function averageGenes(a, b) {
    return {
        speed: (a.speed + b.speed) / 2,
        aggression: (a.aggression + b.aggression) / 2,
        hunger: (a.hunger + b.hunger) / 2
    };
}

function restartSimulation() {
    creatures = [];
    foods = [];
    birthStats = { red: 0, green: 0, blue: 0 };
    deathStats = { red: 0, green: 0, blue: 0 };
    for (let type of ["red", "green", "blue"]) {
        const set = getTypeSettings(capitalize(type));
        if (set.enabled) {
            for (let i = 0; i < set.count; i++) {
                creatures.push(new Creature(type));
            }
        }
    }
}

function updateStats() {
    document.getElementById("bornRed").textContent = birthStats.red;
    document.getElementById("bornGreen").textContent = birthStats.green;
    document.getElementById("bornBlue").textContent = birthStats.blue;
    document.getElementById("deadRed").textContent = deathStats.red;
    document.getElementById("deadGreen").textContent = deathStats.green;
    document.getElementById("deadBlue").textContent = deathStats.blue;
}

function animate() {
    const s = getGlobalSettings();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (foods.length < s.maxFood && Math.random() < 0.2) {
        foods.push(new Food());
    }

    for (let c of creatures) {
        c.update();
        for (let other of creatures) c.interact(other);
        for (let i = foods.length - 1; i >= 0; i--) {
            if (c.eat(foods[i])) {
                foods.splice(i, 1);
                break;
            }
        }
    }

    creatures = creatures.filter(c => !c.isDead());

    for (let f of foods) f.draw();
    for (let c of creatures) c.draw();

    updateStats();
    requestAnimationFrame(animate);
}

restartSimulation();
animate();
