const canvas = document.getElementById("simulation");
const ctx = canvas.getContext("2d");
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

const COLORS = {
    red: "#ff3b3b",
    green: "#3bff3b",
    blue: "#3b3bff"
};

let creatures = [];
let foods = [];

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

class Creature {
    constructor(type, x, y, genes = null) {
        const global = getGlobalSettings();
        const local = getTypeSettings(capitalize(type));
        this.x = x ?? Math.random() * width;
        this.y = y ?? Math.random() * height;
        this.radius = global.radius;
        this.type = type;
        this.color = COLORS[type];
        this.energy = 100;
        this.cooldown = 0;
        this.alpha = 1;
        this.genes = genes ?? {
            speed: local.speed,
            aggression: local.aggression,
            hunger: local.hunger
        };
        this.vx = (Math.random() - 0.5) * this.genes.speed;
        this.vy = (Math.random() - 0.5) * this.genes.speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < this.radius || this.x > width - this.radius) this.vx *= -1;
        if (this.y < this.radius || this.y > height - this.radius) this.vy *= -1;
        this.energy -= 0.05;
        if (this.cooldown > 0) this.cooldown--;
        if (this.energy <= 0) this.alpha -= 0.02;
        this.seekFood();
    }

    seekFood() {
        if (foods.length === 0) return;
        let closest = null;
        let distMin = Infinity;
        for (let f of foods) {
            const dx = f.x - this.x;
            const dy = f.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && dist < distMin) {
                closest = f;
                distMin = dist;
            }
        }
        if (closest) {
            const dx = closest.x - this.x;
            const dy = closest.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                this.vx += (dx / dist) * 0.01 * this.genes.hunger;
                this.vy += (dy / dist) * 0.01 * this.genes.hunger;
            }
        }
    }

    interact(other) {
        if (this === other) return;
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.radius * 4 && dist > 0) {
            if (this.type === "green" && other.type === "red") {
                this.vx -= dx / dist * 0.05 * this.genes.aggression;
                this.vy -= dy / dist * 0.05 * this.genes.aggression;
            }
            if (this.type === "blue" && other.type === "green") {
                this.vx += dx / dist * 0.05 * this.genes.aggression;
                this.vy += dy / dist * 0.05 * this.genes.aggression;
            }

            if (this.type === other.type && dist < this.radius * 2 && this.cooldown === 0 && other.cooldown === 0) {
                if (creatures.length < getGlobalSettings().maxCreatures) {
                    const childGenes = mutateGenes(avgGenes(this.genes, other.genes));
                    creatures.push(new Creature(this.type, this.x, this.y, childGenes));
                    this.energy -= 15;
                    other.energy -= 15;
                    this.cooldown = 100;
                    other.cooldown = 100;
                }
            }
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
        ctx.beginPath();
        ctx.globalAlpha = this.alpha;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.alpha <= 0;
    }
}

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

function avgGenes(g1, g2) {
    return {
        speed: (g1.speed + g2.speed) / 2,
        aggression: (g1.aggression + g2.aggression) / 2,
        hunger: (g1.hunger + g2.hunger) / 2
    };
}

function mutateGenes(g) {
    const m = getGlobalSettings().mutationChance;
    return {
        speed: Math.max(0.3, g.speed + (Math.random() - 0.5) * m),
        aggression: clamp01(g.aggression + (Math.random() - 0.5) * m),
        hunger: clamp01(g.hunger + (Math.random() - 0.5) * m)
    };
}

function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}

class Food {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "yellow";
        ctx.fill();
    }
}

function updateStats() {
    const stats = document.getElementById("stats");
    const counts = { red: 0, green: 0, blue: 0 };
    for (let c of creatures) counts[c.type]++;
    stats.innerHTML = `
        Красные: ${counts.red}<br>
        Зелёные: ${counts.green}<br>
        Синие: ${counts.blue}<br>
        Еда: ${foods.length}<br>
        Всего: ${creatures.length}
    `;
}

function restartSimulation() {
    creatures = [];
    foods = [];
    for (let type of ["red", "green", "blue"]) {
        const set = getTypeSettings(capitalize(type));
        if (set.enabled) {
            for (let i = 0; i < set.count; i++) {
                creatures.push(new Creature(type));
            }
        }
    }
}

function animate() {
    const s = getGlobalSettings();
    ctx.clearRect(0, 0, width, height);

    if (foods.length < s.maxFood && Math.random() < 0.1) {
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