
export class CreatureAI {
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

        for (let f of window.foods || []) {
            const dx = f.x - c.x;
            const dy = f.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const score = c.genes.hunger * (1 / (dist + 1));
            if (score > bestScore) {
                bestScore = score;
                bestTarget = { x: f.x, y: f.y, reason: "food" };
            }
        }

        for (let other of window.creatures || []) {
            if (other === c) continue;
            const dx = other.x - c.x;
            const dy = other.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (c.type === "green" && other.type === "red" && dist < 100) {
                bestTarget = {
                    x: c.x - dx,
                    y: c.y - dy,
                    reason: "flee"
                };
                break;
            }
            if (c.type === "blue" && other.type === "green" && dist < 100) {
                bestTarget = {
                    x: other.x,
                    y: other.y,
                    reason: "hunt"
                };
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
