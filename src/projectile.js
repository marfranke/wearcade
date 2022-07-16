AFRAME.registerPrimitive('a-projectile', {
    defaultComponents: {
        projectile: {},
        gravitation: {},
        velocity: {},
        position: {x: 0, y: 0, z: 0},
        geometry: {primitive: 'sphere', radius: 0.05},
        material: 'color: yellow'
    },

    mappings: {
        radius: 'geometry.radius',
        gravity: 'gravitation.y',
        permanent: 'projectile.invincible'
    }
});

AFRAME.registerComponent('projectile', {
    schema: {
        invincible: {type: 'boolean', default: false},
    },

    tick: function() {
        if (!this.data.invincible) {
            const pos = new THREE.Vector3(0, 0, 0);
            this.el.object3D.getWorldPosition(pos);
            let minY = 1e10;
            const worldPieces = this.el.sceneEl.querySelectorAll('#world a-hexworld');
            worldPieces.forEach(piece => {
                try {
                    const y = piece.components.hexworld.r2h(pos.x, pos.z);
                    if (!isNaN(y)) {
                        minY = y;
                    }
                } catch(e) {}
            });
            if (pos.y < minY) {
                this.el.remove();
                console.log("Destroy Projectile");
            }
        }
    }
});