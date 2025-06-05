diff --git a/ai.js b/ai.js
index e69de29bb2d1d6434b8b29ae775ad8c2e48c5391..43a33b9d950d6b0927cbce5cdd8746dec4f81243 100644
--- a/ai.js
+++ b/ai.js
@@ -0,0 +1,59 @@
+// Advanced AI behaviour for creatures
+function advancedThink(creature, creatures, foods) {
+    let bestTarget = null;
+    let bestScore = -Infinity;
+    let avoid = false;
+    const sight = creature.genes.sight ?? 150;
+
+    // Interaction with other creatures
+    for (let other of creatures) {
+        if (other === creature) continue;
+        const dx = other.x - creature.x;
+        const dy = other.y - creature.y;
+        const dist = Math.sqrt(dx * dx + dy * dy);
+        if (dist > sight) continue;
+
+        if ((creature.type === 'red' || creature.type === 'blue') && other.type === 'green') {
+            const score = creature.genes.aggression / (dist + 1);
+            if (score > bestScore) {
+                bestScore = score;
+                bestTarget = { x: other.x, y: other.y };
+                avoid = false;
+            }
+        }
+        if (creature.type === 'green' && other.type === 'red') {
+            const score = creature.genes.aggression / (dist + 1);
+            if (score > bestScore) {
+                bestScore = score;
+                bestTarget = { x: other.x, y: other.y };
+                avoid = true;
+            }
+        }
+    }
+
+    // Search for food
+    for (let f of foods) {
+        const dx = f.x - creature.x;
+        const dy = f.y - creature.y;
+        const dist = Math.sqrt(dx * dx + dy * dy);
+        if (dist > sight) continue;
+        const score = creature.genes.hunger / (dist + 1);
+        if (score > bestScore) {
+            bestScore = score;
+            bestTarget = { x: f.x, y: f.y };
+            avoid = false;
+        }
+    }
+
+    if (bestTarget) {
+        let dx = bestTarget.x - creature.x;
+        let dy = bestTarget.y - creature.y;
+        let angleTo = Math.atan2(dy, dx);
+        if (avoid) angleTo += Math.PI; // run away
+        let delta = angleTo - creature.angle;
+        delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
+        creature.turnSpeed += delta * 0.1;
+    }
+}
+
+
