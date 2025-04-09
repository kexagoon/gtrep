
export class CreatureAI {
    constructor(creature) {
        this.c = creature;
        this.avoidZones = [];
    }

    think() {
        const { c } = this;

        let closest = null;
        let distMin = Infinity;

        // Избегаем плохих зон
        for (let zone of this.avoidZones) {
            const dx = zone.x - c.x;
            const dy = zone.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 50) {
                c.angle += Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
                return;
            }
        }

        // Поиск еды или врагов
        for (let f of window.foods || []) {
            const dx = f.x - c.x;
            const dy = f.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && dist < distMin) {
                closest = { x: f.x, y: f.y };
                distMin = dist;
            }
        }

        if (closest) {
            const dx = closest.x - c.x;
            const dy = closest.y - c.y;
            const angleTo = Math.atan2(dy, dx);
            let delta = angleTo - c.angle;
            if (delta > Math.PI) delta -= 2 * Math.PI;
            if (delta < -Math.PI) delta += 2 * Math.PI;
            c.angle += delta * 0.1;
        } else {
            c.angle += (Math.random() - 0.5) * 0.05;
        }

        // Запомнить плохое место, если энергия резко упала
        if (c.energy < 30 && Math.random() < 0.01) {
            this.avoidZones.push({ x: c.x, y: c.y });
            if (this.avoidZones.length > 20) this.avoidZones.shift();
        }
    }
}
