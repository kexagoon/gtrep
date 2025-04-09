
// === Встроенный AI (без импорта) ===
class CreatureAI {
    constructor(creature) {
        this.c = creature;
        this.memory = {
            badZones: [],
            lastFoodSeen: 0,
            lastEnemySeen: 0
        };
    }

    think() {
        const { c } = this;

        let bestTarget = null;
        let bestScore = -Infinity;

        for (let f of foods) {
            const dx = f.x - c.x;
            const dy = f.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const score = c.genes.hunger * (1 / (dist + 1));
            if (score > bestScore) {
                bestScore = score;
                bestTarget = { x: f.x, y: f.y, reason: "food" };
            }
        }

        for (let other of creatures) {
            if (other === c) continue;
            const dx = other.x - c.x;
            const dy = other.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (c.type === "green" && other.type === "red" && dist < 100) {
                bestTarget = { x: c.x - dx, y: c.y - dy, reason: "flee" };
                break;
            }
            if (c.type === "blue" && other.type === "green" && dist < 100) {
                bestTarget = { x: other.x, y: other.y, reason: "hunt" };
                break;
            }
        }

        if (bestTarget) {
            const dx = bestTarget.x - c.x;
            const dy = bestTarget.y - c.y;
            const angleTo = Math.atan2(dy, dx);
            let delta = angleTo - c.angle;
            delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
            c.turnSpeed += delta * 0.1;
            c.turnSpeed *= 0.7;
        } else {
            c.turnSpeed += (Math.random() - 0.5) * 0.02;
            c.turnSpeed *= 0.8;
        }

        if (c.energy < 20 && Math.random() < 0.01) {
            this.memory.badZones.push({ x: c.x, y: c.y, t: Date.now() });
            if (this.memory.badZones.length > 50) this.memory.badZones.shift();
        }
    }
}

// === Основной код симуляции ===

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
        this.age = 0;

        this.genes = genes ?? {
            speed: local.speed,
            aggression: local.aggression,
            hunger: local.hunger
        };

        this.angle = Math.random() * Math.PI * 2;
        this.turnSpeed = 0;
        this.ai = new CreatureAI(this);
    }

    update() {
        this.energy -= 0.05;
        this.age++;
        if (this.cooldown > 0) this.cooldown--;

        this.ai.think();
        this.move();
    }

    move() {
        const maxTurn = 0.05;
        this.turnSpeed = Math.max(-maxTurn, Math.min(maxTurn, this.turnSpeed));
        this.angle += this.turnSpeed;
        const speed = this.genes.speed;
        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;

        if (this.x < this.radius || this.x > width - this.radius) {
            this.angle = Math.PI - this.angle;
        }
        if (this.y < this.radius || this.y > height - this.radius) {
            this.angle = -this.angle;
        }
    }

    interact(other) {
        if (this === other) return;
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.radius * 4 && dist > 0) {
            if (this.type === other.type && dist < this.radius * 2 && this.cooldown === 0 && other.cooldown === 0) {
                if (creatures.length < getGlobalSettings().maxCreatures) {
                    const childGenes = mutateGenes(avgGenes(this.genes, other.genes), this, other);
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
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    isDead() {
        return this.alpha <= 0;
    }
}

class Food {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
    }

    draw() {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#f0e68c";
        ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
        ctx.globalAlpha = 1;
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

function mutateGenes(g, parent1, parent2) {
    const m = getGlobalSettings().mutationChance;
    let newGenes = {
        speed: Math.max(0.3, g.speed + (Math.random() - 0.5) * m),
        aggression: clamp01(g.aggression + (Math.random() - 0.5) * m),
        hunger: clamp01(g.hunger + (Math.random() - 0.5) * m)
    };
    const ageBonus = Math.min(1, (parent1.age + parent2.age) / 2000);
    newGenes.speed += ageBonus * 0.1;
    newGenes.hunger += ageBonus * 0.05;
    return newGenes;
}

function clamp01(x) {
    return Math.max(0, Math.min(1, x));
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
