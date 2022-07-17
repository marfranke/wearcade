AFRAME.registerComponent('weapon', {
    dependencies: ['hand-controls'],

    schema: {
        maxRadius: {type: 'number', default: 0.035},
        minTrigger: {type: 'number', default: 0.1},
        minFireRadius: {type: 'number', default: 0.007}
    },

    init: function () {
        this.radius = 0;

        this.el.addEventListener('triggerchanged', (event) => {
            this.radius = Math.max(this.radius, event.detail.value * maxRadius);
            this.el.querySelector('a-projectile').setAttribute('radius', this.radius);
            if (event.detail.value < minTrigger && this.radius >= minFireRadius) {
                const object3D = this.el.querySelector('a-projectile').object3D;
                const pos = new THREE.Vector3(0, 0, 0);
                const rot = new THREE.Vector3(0, 0, 0);
                object3D.getWorldPosition(pos);
                object3D.getWorldDirection(rot);
                rot.multiplyScalar(-25);
                const projectile = document.createElement('a-projectile');
                projectile.setAttribute('position', pos);
                projectile.setAttribute('velocity', {
                    x: rot.x,
                    y: rot.y,
                    z: rot.z,
                    easingX: 0,
                    easingY: 0,
                    easingZ: 0
                });
                projectile.setAttribute('radius', this.radius);
                this.el.sceneEl.appendChild(projectile);
                this.radius = 0;
                this.el.querySelector('a-projectile').setAttribute('radius', this.radius);
            }
        });
    }
});
