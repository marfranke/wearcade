AFRAME.registerPrimitive('a-projectile', {
    defaultComponents: {
        projectile: {},
        gravitation: {},
        velocity: {},
        position: {x: 0, y: 0, z: 0},
        geometry: {primitive: 'sphere', segmentsWidth: 18, segmentsHeight: 9, radius: 0.035},
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
            const minY = document.getElementById('world').components.world.getHeight(pos);
            if (isNaN(minY) || pos.y < minY) {
                this.el.remove();
                console.log("Destroy Projectile");
            }
        }
    }
});